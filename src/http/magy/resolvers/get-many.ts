import { get, has, omit } from 'lodash'
import { ModelType, Projection, VirtualModel } from '../../../kernel/model'
import { ParsedFields, QueryModifier, QueryReflector, Resolver, useResolver } from '../middleware'
import { ModelQueryManager } from '../model'

const DEFAULT_MAX_LIMIT = 40

export const getModel = <T>(model: ModelType<T>, ref: 'self' | ModelType<T>) => {
    return ref === 'self' ? model : ref
}

export const populateByFields = async <T>(
    docs: T[],
    model: VirtualModel<T>,
    fields: ParsedFields,
    prefix = ''
) => {
    const config = ModelQueryManager.getConfig(model)

    for (const field of Object.keys(fields)) {
        const fieldPath = prefix + field
        const fieldValue = fields[field]

        if (config.fields && has(config.fields, fieldPath)) {
            const fieldsOrOptions = get(config.fields, fieldPath)

            if (fieldValue !== 1) {
                if ('model' in fieldsOrOptions) {
                    const refModel = getModel(model, fieldsOrOptions.model as ModelType<any>)
                    const projection = buildProjection(refModel, fieldValue)

                    await model.populate(docs, {
                        path: fieldPath as any,
                        project: projection,
                        model: refModel,
                        pipe: async subDocs => {
                            if (subDocs.length > 0) {
                                await populateByFields(subDocs, refModel, fieldValue)
                            }
                        }
                    })
                } else {
                    await populateByFields(docs, model, fieldValue, prefix + field + '.')
                }
            }
        }
    }
}

export const buildProjection = <T>(
    model: VirtualModel<T>,
    fields: ParsedFields,
    prefix = ''
) => {
    const config = ModelQueryManager.getConfig(model)
    const projection: Projection<any> = {}

    for (const field of Object.keys(fields)) {
        const fieldPath = prefix + field
        const fieldValue = fields[field]

        if (config.fields && has(config.fields, fieldPath)) {
            const fieldsOrOptions = get(config.fields, fieldPath)

            if (
                'model' in fieldsOrOptions ||
                'excluded' in fieldsOrOptions
            ) {
                if (!fieldsOrOptions.excluded) {
                    projection[fieldPath] = 1
                }
            } else {
                if (fieldValue === 1) {
                    projection[fieldPath] = 1
                } else {
                    Object.assign(projection, buildProjection(model, fieldValue,
                        prefix + field + '.'))
                }
            }
        } else {
            if (fieldValue === 1) {
                projection[fieldPath] = 1
            } else {
                Object.assign(projection, buildProjection(model, fieldValue,
                    prefix + field + '.'))
            }
        }
    }

    return projection
}

export const dataFetcher: Resolver = async (req, model, query, options) => {
    const projection = buildProjection(model, query.fields)

    Object.assign(projection, { _id: 1 })

    const queryModifier: QueryModifier = {
        expect: field => !!get(query.fields, field),
        include: (...fields) => {
            for (const field of fields) {
                projection[field] = 1
            }
        },
        exclude: (...fields) => {
            for (const field of fields) {
                delete projection[field]
            }
        },
        addFilter: (field, filter) => {
            query.filter[field] = filter
        },
        removeFilter: (...fields) => {
            query.filter = omit(query.filter, fields)
        },
        project: (field, projection) => {
            Object.assign(projection, {
                [field]: projection
            })
        }
    }

    const queryReflector: QueryReflector = {
        expect: field => !!get(query.fields, field)
    }

    if (options.beforeResolve) {
        await options.beforeResolve(req, model, queryModifier)
    }

    const docs = await model
        .aggregate([
            {
                $match: query.filter
            },
            {
                $project: projection
            },
            ...query.sort ? [{
                $sort: query.sort
            }] : []
        ])
        .skip(query.skip ?? 0)
        .limit(
            (
                query.limit &&
                query.limit < (options.maxLimit ?? DEFAULT_MAX_LIMIT)
            )
                ? query.limit
                : (options.maxLimit ?? DEFAULT_MAX_LIMIT)
        )
        .toArray()

    if (docs.length > 0) {
        await populateByFields(docs, model, query.fields)
    }

    if (options.afterResolve) {
        await options.afterResolve(req, docs, queryReflector)
    }

    return docs
}

export default useResolver(dataFetcher)

