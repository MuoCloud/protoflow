import { NotFound } from 'http-errors'
import { ModelQueryManager } from '../../../kernel/magy/model'
import { useResolver } from '../middleware'
import { dataFetcher } from './get-many'

export default useResolver(async (req, model, query, options) => {
    const queryConfig = ModelQueryManager.getConfig(model)

    query.limit = 1

    const docs = await dataFetcher(req, model, query, options)

    if (Array.isArray(docs) && docs.length > 0) {
        return docs[0]
    } else {
        throw new NotFound(`${queryConfig.resourceName ?? 'Resource'} is not found`)
    }
})
