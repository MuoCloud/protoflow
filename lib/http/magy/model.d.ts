import { BaseModel, ModelType, RefKeyOf, VirtualModel } from '../../kernel/model';
export interface ModelQueryConfigs {
    [id: number]: QueryConfig<any>;
}
export interface FieldOptions {
    model?: ModelType<any> | 'self';
    excluded?: boolean;
}
export interface QueryCustomFields {
    [key: string]: QueryCustomFields | FieldOptions;
}
export declare type QueryFields<Model> = {
    [key in RefKeyOf<Model, BaseModel>]?: QueryFields<Model> | FieldOptions;
};
export interface QueryConfig<Model extends BaseModel> {
    resourceName?: string;
    fields?: QueryFields<Model> & QueryCustomFields;
}
export declare type StatefulQueryConfig<State extends BaseState> = <M>(state: State) => QueryConfig<M>;
export interface BaseState {
    [key: string]: any;
}
export declare class ModelQueryManager {
    static modelQueryConfigs: ModelQueryConfigs;
    static storeConfig<Model>(model: VirtualModel<Model>, config: QueryConfig<Model>): void;
    static getConfig<Model>(model: VirtualModel<Model>): QueryConfig<any>;
}
export declare const useQuery: <Model>(model: VirtualModel<Model>, config: QueryConfig<Model>) => VirtualModel<Model>;
