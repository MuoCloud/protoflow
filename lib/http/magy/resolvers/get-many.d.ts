import { ModelType, Projection, VirtualModel } from '../../../kernel/model';
import { ParsedFields, Resolver } from '../middleware';
export declare const getModel: <T>(model: ModelType<T>, ref: "self" | ModelType<T>) => ModelType<T>;
export declare const populateByFields: <T>(docs: T[], model: VirtualModel<T>, fields: ParsedFields, prefix?: string) => Promise<void>;
export declare const buildProjection: <T>(model: VirtualModel<T>, fields: ParsedFields, prefix?: string) => Projection<any>;
export declare const dataFetcher: Resolver;
declare const _default: import("../middleware").DefinedResolver;
export default _default;
