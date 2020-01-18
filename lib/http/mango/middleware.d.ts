import { ModelType } from '../../kernel/model';
import { ParsedObject } from '../../kernel/mql';
import { Middleware, Request } from '../context';
import { ReducedFields } from './resolvers/get-many';
export interface ResolverContext {
    query: {
        mql: string;
        mqlParseMode: 'json' | 'dsl';
    };
}
export interface ParsedQuery {
    skip?: number;
    limit?: number;
    sort?: ParsedSort;
    filter: ParsedObject;
    fields: ParsedFields;
}
export interface ParsedFields {
    [key: string]: 1 | ParsedFields;
}
export interface ParsedSort {
    [key: string]: 1 | -1;
}
export interface ResolverHooks<T, Context> {
    beforeResolve?: (req: Request<Context>, query: ParsedQuery, modifier: QueryModifier) => void | Promise<void>;
    beforeExec?: (model: ModelType<T>, query: ParsedQuery, reducedFields: ReducedFields) => void | Promise<void>;
    afterResolve?: (req: Request<Context>, docs: T | T[]) => void | Promise<void>;
}
export declare type Resolver = <T, Context>(model: ModelType<T>, query: ParsedQuery, hooks: ResolverHooks<T, Context>) => Promise<T | T[]>;
export declare type DefinedResolver = <T, Context>(model: ModelType<T>, hooks: ResolverHooks<T, Context>) => Middleware<any>;
export interface QueryModifier {
    exclude: (...fields: string[]) => void;
}
export declare const useResolver: (resolver: Resolver) => DefinedResolver;
