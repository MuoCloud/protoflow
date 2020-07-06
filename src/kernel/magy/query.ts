import { get, has } from 'lodash'
import { ParsedObject } from 'protoflow-mql'
import { ModelType, Projection, VirtualModel } from '../model'
import { PromiseOr } from '../syntax'
import { ModelQueryManager } from './model'

export interface ParsedQuery {
    skip?: number
    limit?: number
    sort?: ParsedSort
    filter: ParsedObject
    fields: ParsedFields
}

export interface ParsedFields {
    [key: string]: 1 | ParsedFields
}

export interface ParsedSort {
    [key: string]: 1 | -1
}

export interface ResolveQueryOptions {
    maxLimit?: number
    beforeExec?: (projection: Projection<any>) => PromiseOr<void>
    customCommands?: any[]
}

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
            const fieldsOrOptions = get(config.fields, fieldPath, {})

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
            const fieldsOrOptions = get(config.fields, fieldPath, {})

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

export const resolveQuery = async <T>(
    model: ModelType<T>,
    query: ParsedQuery,
    options: ResolveQueryOptions = {}
) => {
    const projection = buildProjection(model, query.fields)

    Object.assign(projection, { _id: 1 })

    if (options.beforeExec) {
        await options.beforeExec(projection)
    }

    const docs = await model
        .aggregate([
            {
                $match: query.filter
            },
            {
                $project: projection
            },
            ...options.customCommands ?? [],
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

    return docs
}
