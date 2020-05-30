import { ParsedQuery } from '../../../kernel/magy/query';
import { Projection } from '../../../kernel/model';
import { QueryModifier, QueryReflector, Resolver } from '../middleware';
export declare const buildQueryModifier: (query: ParsedQuery, projection: Projection<any>) => QueryModifier;
export declare const buildQueryReflector: (query: ParsedQuery) => QueryReflector;
export declare const dataFetcher: Resolver;
declare const _default: import("../middleware").DefinedResolver;
export default _default;
