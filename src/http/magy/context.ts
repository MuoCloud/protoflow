import { getParser, parseJsonifiedMQL } from 'protoflow-mql'
import { parsedObjectToQuery } from '../../kernel/magy/convert'
import { Request } from '../context'

export interface MQLContext {
    query: {
        mql: string
        mqlParseMode: 'json' | 'dsl'
    }
}

const parseMQL = getParser('object')

export const getParsedQuery = (req: Request<MQLContext>) => {
    const parsedObject = req.query.mql
        ? (
            req.query.mqlParseMode === 'dsl'
                ? parseMQL(req.query.mql)
                : parseJsonifiedMQL(req.query.mql)
        ) : {}

    return parsedObjectToQuery(parsedObject)
}
