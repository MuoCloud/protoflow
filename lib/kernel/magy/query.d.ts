import { ModelType, Projection, VirtualModel } from '../model';
import { ParsedObject } from '../mql';
import { PromiseOr } from '../syntax';
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
export interface ResolveQueryOptions {
    maxLimit?: number;
    beforeExec?: (projection: Projection<any>) => PromiseOr<void>;
}
export declare const getModel: <T>(model: ModelType<T>, ref: "self" | ModelType<T>) => ModelType<T>;
export declare const populateByFields: <T>(docs: T[], model: VirtualModel<T>, fields: ParsedFields, prefix?: string) => Promise<void>;
export declare const buildProjection: <T>(model: VirtualModel<T>, fields: ParsedFields, prefix?: string) => Projection<any>;
export declare const resolveQuery: <T>(model: ModelType<T>, query: ParsedQuery, options: ResolveQueryOptions) => Promise<T[]>;
