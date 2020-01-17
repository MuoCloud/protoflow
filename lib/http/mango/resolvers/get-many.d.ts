import { PopulateOptions, VirtualModel } from '../../../kernel/model';
import { ParsedFields, Resolver } from '../middleware';
export declare type Fields = ParsedFields;
export interface ReducedFields {
    [key: string]: 1 | {};
}
export interface TrivialPopulateModels {
    [field: string]: 'self' | VirtualModel<any>;
}
export declare const getModel: <T>(model: VirtualModel<T>, ref: "self" | VirtualModel<T>) => VirtualModel<T>;
export declare const reduceFields: <T>(model: VirtualModel<T>, fields: ParsedFields, prefix?: string) => ParsedFields;
export declare const buildPopulateOptions: <T>(model: VirtualModel<T>, fields: ParsedFields) => PopulateOptions<T, any>[];
export declare const dataPopulator: <T>(docs: T[], model: VirtualModel<T>, fields: ParsedFields) => Promise<void>;
export declare const dataFetcher: Resolver;
declare const _default: import("../middleware").DefinedResolver;
export default _default;
