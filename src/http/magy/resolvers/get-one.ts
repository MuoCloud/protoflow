import { NotFound } from 'http-errors'
import { get, omit } from 'lodash'
import { ModelQueryManager } from '../../../kernel/magy/model'
import { ParsedQuery, resolveQuery } from '../../../kernel/magy/query'
import { Projection } from '../../../kernel/model'
import { QueryModifier, QueryReflector, Resolver, useResolver } from '../middleware'

const buildQueryModifier = (
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

const buildQueryReflector = (query: ParsedQuery): QueryReflector => ({
    expect: field => !!get(query.fields, field)
})

export const dataFetcher: Resolver = async (req, model, query, options) => {
    const queryConfig = ModelQueryManager.getConfig(model)

    if (options._id) {
        query.filter._id = options._id(req)
    }

    const docs = await resolveQuery(model, query, {
        maxLimit: 1,
        beforeExec: async projection => {
            if (options.beforeResolve) {
                await options.beforeResolve(req, model,
                    buildQueryModifier(query, projection))
            }
        }
    })

    if (Array.isArray(docs) && docs.length > 0) {
        const doc = docs[0]

        if (options.afterResolve) {
            await options.afterResolve(req, doc, buildQueryReflector(query))
        }

        return doc
    } else {
        throw new NotFound(`${queryConfig.resourceName ?? 'Resource'} is not found`)
    }
}

export default useResolver(dataFetcher)
