import { ModelType } from '../../kernel/model';
import { ParsedObject } from '../../kernel/mql';
import { Middleware, Request } from '../context';
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
export interface ResolverOptions<T, Context> {
    maxLimit?: number;
    beforeResolve?: (req: Request<Context>, queryModifier: QueryModifier) => void | Promise<void>;
    beforeExec?: (model: ModelType<T>, rawQueryModifier: RawQueryModifier) => void | Promise<void>;
    afterResolve?: (req: Request<Context>, docs: T | T[], queryReflector: QueryReflector) => void | Promise<void>;
}
export declare type Resolver = <T, Context>(model: ModelType<T>, query: ParsedQuery, options: ResolverOptions<T, Context>) => Promise<T | T[]>;
export declare type DefinedResolver = <T, Context>(model: ModelType<T>, options: ResolverOptions<T, Context>) => Middleware<any>;
export interface QueryModifier {
    expect: (field: string) => boolean;
    include: (...fields: string[]) => void;
    exclude: (...fields: string[]) => void;
    addFilter: (field: string, filter: any) => void;
    removeFilter: (...field: string[]) => void;
}
export interface RawQueryModifier extends QueryModifier {
    project: (field: string, projection: any) => void;
}
export interface QueryReflector {
    expect: (field: string) => boolean;
}
export declare const useResolver: (resolver: Resolver) => DefinedResolver;
