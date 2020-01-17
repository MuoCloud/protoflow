import { omit } from 'lodash'
import { ModelType } from '../../kernel/model'
import { jsonToObject, ParsedObject } from '../../kernel/mql'
import { Middleware, Request } from '../context'

export interface ResolverContext {
    query: {
        mqlJson: string
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
    [key: string]: 1 | {} | ParsedFields
}

export interface ParsedSort {
    [key: string]: 1 | -1
}

export interface ResolverHooks<T, Context> {
    beforeResolve?: (req: Request<Context>, query: ParsedQuery, modifier: QueryModifier) => void | Promise<void>
    afterResolve?: (req: Request<Context>, docs: T | T[]) => void | Promise<void>
}

export type Resolver = <T>(model: ModelType<T>, query: ParsedQuery) => Promise<T | T[]>
export type DefinedResolver = <T, Context>(model: ModelType<T>, hooks: ResolverHooks<T, Context>) => Middleware<any>

export interface QueryModifier {
    exclude: (...fields: string[]) => void
    cond: (field: string, cond: any[]) => void
}

export const useResolver = (
    resolver: Resolver
): DefinedResolver =>
    (model, hooks = {}) =>
        async (req, res) => {
            const mqlObject = !!req.query.mqlJson ? jsonToObject(req.query.mqlJson) : {}

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
                },
                cond: (field, cond) => {
                    parsedQuery.fields[field] = { __directive: 1, $cond: cond }
                }
            }

            if (hooks.beforeResolve) {
                await hooks.beforeResolve(req, parsedQuery, modifier)
            }

            const docs = await resolver(model, parsedQuery)

            if (hooks.afterResolve) {
                await hooks.afterResolve(req, docs)
            }

            res.send(docs)
        }
