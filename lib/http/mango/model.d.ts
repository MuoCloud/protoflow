import { BaseModel, ModelType, RefKeyOf, VirtualModel } from '../../kernel/model';
export interface ModelQueryConfigs {
    [id: number]: QueryConfig<any>;
}
export interface QueryConfig<Model extends BaseModel> {
    resourceName?: string;
    fields?: {
        exclude?: string[];
        populateModel?: {
            [key in RefKeyOf<Model, BaseModel>]?: ModelType<any> | 'self';
        };
    };
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
