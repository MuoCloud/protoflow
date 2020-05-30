import { getParser, ParsedObject } from 'protoflow-mql'
import { ParsedFields, ParsedQuery, ParsedSort } from './query'

const parseMQL = getParser('object')

export const parsedObjectToQuery = (parsedObject: ParsedObject) => {
    const parsedQuery: ParsedQuery = {
        skip: parsedObject.skip as number,
        limit: parsedObject.limit as number,
        filter: parsedObject.filter as ParsedObject ?? {},
        fields: parsedObject.fields as ParsedFields ?? {},
        sort: parsedObject.sort as ParsedSort
    }

    return parsedQuery
}

export const buildQuery = (mql: string) =>
    parsedObjectToQuery(parseMQL(mql))
