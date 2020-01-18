import { omit, reduce } from 'lodash'
import { PopulateOptions, VirtualModel } from '../../../kernel/model'
import { ParsedFields, Resolver, useResolver } from '../middleware'
import { ModelQueryManager } from '../model'

const DEFAULT_LIMIT = 20

export type Fields = ParsedFields

export interface ReducedFields {
    [key: string]: 1
}

export interface TrivialPopulateModels {
    [field: string]: 'self' | VirtualModel<any>
}

export const getModel = <T>(model: VirtualModel<T>, ref: 'self' | VirtualModel<T>) => {
    return ref === 'self' ? model : ref
}

export const reduceFields = <T>(model: VirtualModel<T>, fields: Fields, prefix = '') => {
    const config = ModelQueryManager.getConfig(model)
    const refModels = (config.fields && config.fields.populateModel)
        ? config.fields.populateModel as TrivialPopulateModels
        : {}

    return reduce<string, ReducedFields>(Object.keys(fields), (reduced, field) => {
        if (fields[field] === 1 || field in refModels) {
            if (prefix !== '') {
                reduced[`${prefix}.${field}`] = 1
            } else {
                reduced[field] = 1
            }
        } else {
            Object.assign(reduced, reduceFields(model, fields[field] as Fields, prefix + field))
        }

        return reduced
    }, {})
}

export const buildPopulateOptions = <T>(model: VirtualModel<T>, fields: Fields) => {
    const config = ModelQueryManager.getConfig(model)
    const populateOptions: PopulateOptions<T>[] = []

    if (config.fields && config.fields.populateModel) {
        const refModels = config.fields.populateModel as TrivialPopulateModels

        for (const field of Object.keys(fields)) {
            if (fields[field] !== 1) {
                if (field in refModels) {
                    const nextFields = fields[field] as Fields
                    const reducedFields = reduceFields(model, nextFields)
                    const refModel = getModel(model, refModels[field])

                    Object.assign(reducedFields, { _id: 1 })

                    populateOptions.push({
                        path: field as any,
                        project: reducedFields,
                        model: refModel,
                        pipe: async docs => {
                            const options = buildPopulateOptions(refModel, nextFields)

                            if (options.length > 0) {
                                await refModel.populate(docs, options)
                            }
                        }
                    })
                }
            }
        }
    }

    return populateOptions
}

export const dataPopulator = async <T>(docs: T[], model: VirtualModel<T>, fields: Fields) => {
    await model.populate(docs, buildPopulateOptions(model, fields))
}

export const dataFetcher: Resolver = async (model, query) => {
    const queryConfig = ModelQueryManager.getConfig(model)

    if (queryConfig.fields && queryConfig.fields.exclude) {
        query.fields = omit(query.fields, queryConfig.fields.exclude)
    }

    const reducedFields = reduceFields(model, query.fields)

    Object.assign(reducedFields, { _id: 1 })

    const docs = await model
        .aggregate([
            {
                $match: query.filter
            },
            {
                $project: reducedFields
            },
            ...query.sort ? [{
                $sort: query.sort
            }] : []
        ])
        .skip(query.skip || 0)
        .limit(query.limit || DEFAULT_LIMIT)
        .toArray()

    await dataPopulator(docs, model, query.fields)

    return docs
}

export default useResolver(dataFetcher)

