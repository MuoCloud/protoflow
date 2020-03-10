import { ParsedFields, ParsedQuery, ParsedSort } from '../../kernel/magy/query'
import { ModelType } from '../../kernel/model'
import { getParser, ParsedObject, parseJsonifiedMQL } from '../../kernel/mql'
import { ArrayOr, PromiseOr } from '../../kernel/syntax'
import { Middleware, Request } from '../context'

export interface ResolverContext {
    query: {
        mql: string
        mqlParseMode: 'json' | 'dsl'
    }
}

export interface ResolverOptions<T, Context> {
    maxLimit?: number

    beforeResolve?: (
        req: Request<Context>,
        model: ModelType<T>,
        queryModifier: QueryModifier
    ) => PromiseOr<void>

    afterResolve?: (
        req: Request<Context>,
        docs: ArrayOr<T>,
        queryReflector: QueryReflector
    ) => PromiseOr<void>
}

export type Resolver = <T, Context>(
    req: Request<Context>,
    model: ModelType<T>,
    query: ParsedQuery,
    options: ResolverOptions<T, Context>
) => Promise<T | T[]>

export type DefinedResolver = <T, Context>(
    model: ModelType<T>,
    options: ResolverOptions<T, Context>
) => Middleware<any>

export interface QueryModifier {
    expect: (field: string) => boolean
    include: (...fields: string[]) => void
    exclude: (...fields: string[]) => void
    addFilter: (field: string, filter: any) => void
    removeFilter: (...field: string[]) => void
    project: (field: string, projection: any) => void
}

export interface QueryReflector {
    expect: (field: string) => boolean
}

const parseMQL = getParser('object')

export const useResolver = (
    resolver: Resolver
): DefinedResolver =>
    (model, options = {}) =>
        async (req, res) => {
            const mqlObject = (() => {
                if (req.query.mql) {
                    if (req.query.mqlParseMode === 'dsl') {
                        return parseMQL(req.query.mql)
                    } else {
                        return parseJsonifiedMQL(req.query.mql)
                    }
                } else {
                    return {}
                }
            })()

            const parsedQuery: ParsedQuery = {
                skip: mqlObject.skip as number,
                limit: mqlObject.limit as number,
                filter: mqlObject.filter as ParsedObject ?? {},
                fields: mqlObject.fields as ParsedFields ?? {},
                sort: mqlObject.sort as ParsedSort
            }

            const docs = await resolver(req, model, parsedQuery, options)

            res.send(docs)
        }
