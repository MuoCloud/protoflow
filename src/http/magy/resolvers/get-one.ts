import { NotFound } from 'http-errors'
import { ModelQueryManager } from '../../../kernel/magy/model'
import { resolveQuery } from '../../../kernel/magy/query'
import { Resolver, useResolver } from '../middleware'
import { buildQueryModifier, buildQueryReflector } from './get-many'

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
