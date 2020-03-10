import { ParsedQuery } from '../../kernel/magy/query';
import { ModelType } from '../../kernel/model';
import { ArrayOr, PromiseOr } from '../../kernel/syntax';
import { Middleware, Request } from '../context';
export interface ResolverContext {
    query: {
        mql: string;
        mqlParseMode: 'json' | 'dsl';
    };
}
export interface ResolverOptions<T, Context> {
    maxLimit?: number;
    beforeResolve?: (req: Request<Context>, model: ModelType<T>, queryModifier: QueryModifier) => PromiseOr<void>;
    afterResolve?: (req: Request<Context>, docs: ArrayOr<T>, queryReflector: QueryReflector) => PromiseOr<void>;
}
export declare type Resolver = <T, Context>(req: Request<Context>, model: ModelType<T>, query: ParsedQuery, options: ResolverOptions<T, Context>) => Promise<T | T[]>;
export declare type DefinedResolver = <T, Context>(model: ModelType<T>, options: ResolverOptions<T, Context>) => Middleware<any>;
export interface QueryModifier {
    expect: (field: string) => boolean;
    include: (...fields: string[]) => void;
    exclude: (...fields: string[]) => void;
    addFilter: (field: string, filter: any) => void;
    removeFilter: (...field: string[]) => void;
    project: (field: string, projection: any) => void;
}
export interface QueryReflector {
    expect: (field: string) => boolean;
}
export declare const useResolver: (resolver: Resolver) => DefinedResolver;
