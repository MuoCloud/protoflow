import { BaseModel, ModelType, Ref, VirtualModel } from '../model';
export interface ModelQueryConfigs {
    [id: number]: QueryConfig<any>;
}
export interface FieldOptions {
    model?: ModelType<any> | 'self';
    excluded?: boolean;
}
export declare type QueryFields<Model> = {
    [key in keyof Model]?: QueryFields<Model[key] extends Array<any> ? Model[key][0] : Model[key] extends Ref<infer U> ? U : Model[key]> | FieldOptions;
};
export interface QueryConfig<Model extends BaseModel> {
    resourceName?: string;
    fields?: QueryFields<Model>;
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
