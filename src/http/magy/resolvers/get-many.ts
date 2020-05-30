import { get, omit } from 'lodash'
import { ParsedQuery, resolveQuery } from '../../../kernel/magy/query'
import { Projection } from '../../../kernel/model'
import { QueryModifier, QueryReflector, Resolver, useResolver } from '../middleware'

export const buildQueryModifier = (
    query: ParsedQuery,
    projection: Projection<any>
): QueryModifier => ({
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
})

export const buildQueryReflector = (query: ParsedQuery): QueryReflector => ({
    expect: field => !!get(query.fields, field)
})

export const dataFetcher: Resolver = async (req, model, query, options) => {
    const docs = await resolveQuery(model, query, {
        maxLimit: options.maxLimit,
        beforeExec: async projection => {
            if (options.beforeResolve) {
                await options.beforeResolve(req, model,
                    buildQueryModifier(query, projection))
            }
        }
    })

    if (options.afterResolve) {
        await options.afterResolve(req, docs, buildQueryReflector(query))
    }

    return docs
}

export default useResolver(dataFetcher)
