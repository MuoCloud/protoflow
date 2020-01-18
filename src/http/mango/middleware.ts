import { omit } from 'lodash'
import { ModelType } from '../../kernel/model'
import { getParser, jsonToObject, ParsedObject } from '../../kernel/mql'
import { Middleware, Request } from '../context'
import { ReducedFields } from './resolvers/get-many'

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

export interface ResolverHooks<T, Context> {
    beforeResolve?: (req: Request<Context>, query: ParsedQuery, modifier: QueryModifier) => void | Promise<void>
    beforeExec?: (model: ModelType<T>, query: ParsedQuery, reducedFields: ReducedFields) => void | Promise<void>
    afterResolve?: (req: Request<Context>, docs: T | T[]) => void | Promise<void>
}

export type Resolver = <T, Context>(model: ModelType<T>, query: ParsedQuery, hooks: ResolverHooks<T, Context>) => Promise<T | T[]>
export type DefinedResolver = <T, Context>(model: ModelType<T>, hooks: ResolverHooks<T, Context>) => Middleware<any>

export interface QueryModifier {
    exclude: (...fields: string[]) => void
}

const parseMqlToJs = getParser('jsObject')

export const useResolver = (
    resolver: Resolver
): DefinedResolver =>
    (model, hooks = {}) =>
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

            const modifier: QueryModifier = {
                exclude: (...fields) => {
                    parsedQuery.fields = omit(parsedQuery.fields, fields)
                }
            }

            if (hooks.beforeResolve) {
                await hooks.beforeResolve(req, parsedQuery, modifier)
            }

            const docs = await resolver(model, parsedQuery, hooks)

            if (hooks.afterResolve) {
                await hooks.afterResolve(req, docs)
            }

            res.send(docs)
        }
