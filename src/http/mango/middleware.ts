import { omit } from 'lodash'
import { ModelType } from '../../kernel/model'
import { getParser, jsonToObject, ParsedObject } from '../../kernel/mql'
import { Middleware, Request } from '../context'

export interface ResolverContext {
    query: {
        mql: string
        mqlParseMode: 'json' | 'dsl'
    }
}

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

export interface ResolverOptions<T, Context> {
    maxLimit?: number
    beforeResolve?: (req: Request<Context>, queryModifier: QueryModifier) => void | Promise<void>
    beforeExec?: (model: ModelType<T>, rawQueryModifier: RawQueryModifier) => void | Promise<void>
    afterResolve?: (req: Request<Context>, docs: T | T[], queryReflector: QueryReflector) => void | Promise<void>
}

export type Resolver = <T, Context>(model: ModelType<T>, query: ParsedQuery, options: ResolverOptions<T, Context>) => Promise<T | T[]>
export type DefinedResolver = <T, Context>(model: ModelType<T>, options: ResolverOptions<T, Context>) => Middleware<any>

export interface QueryModifier {
    expect: (field: string) => boolean
    include: (...fields: string[]) => void
    exclude: (...fields: string[]) => void
    addFilter: (field: string, filter: any) => void
    removeFilter: (...field: string[]) => void
}

export interface RawQueryModifier extends QueryModifier {
    project: (field: string, projection: any) => void
}

export interface QueryReflector {
    expect: (field: string) => boolean
}

const parseMqlToJs = getParser('jsObject')

export const useResolver = (
    resolver: Resolver
): DefinedResolver =>
    (model, options = {}) =>
        async (req, res) => {
            const mqlObject = (() => {
                if (req.query.mql) {
                    if (req.query.mqlParseMode === 'js') {
                        return parseMqlToJs(req.query.mql)
                    } else {
                        return jsonToObject(req.query.mql)
                    }
                } else {
                    return {}
                }
            })()

            const parsedQuery: ParsedQuery = {
                skip: mqlObject.skip as number,
                limit: mqlObject.limit as number,
                filter: mqlObject.filter as ParsedObject || {},
                fields: mqlObject.fields as ParsedFields || {},
                sort: mqlObject.sort as ParsedSort
            }

            const queryModifier: QueryModifier = {
                expect: field => !!parsedQuery.fields[field],
                include: (...fields) => {
                    for (const field of fields) {
                        parsedQuery.fields[field] = 1
                    }
                },
                exclude: (...fields) => {
                    parsedQuery.fields = omit(parsedQuery.fields, fields)
                },
                addFilter: (field, filter) => {
                    parsedQuery.filter[field] = filter
                },
                removeFilter: (...fields) => {
                    parsedQuery.filter = omit(parsedQuery.filter, fields)
                }
            }

            const queryReflector: QueryReflector = {
                expect: field => !!parsedQuery.fields[field]
            }

            if (options.beforeResolve) {
                await options.beforeResolve(req, queryModifier)
            }

            const docs = await resolver(model, parsedQuery, options)

            if (options.afterResolve) {
                await options.afterResolve(req, docs, queryReflector)
            }

            res.send(docs)
        }
