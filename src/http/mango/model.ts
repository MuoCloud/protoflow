import { BaseModel, ModelType, RefKeyOf, VirtualModel } from '../../kernel/model'

export interface ModelQueryConfigs {
    [id: number]: QueryConfig<any>
}

export interface QueryConfig<Model extends BaseModel> {
    resourceName?: string
    fields?: {
        exclude?: string[]
        populateModel?: {
            [key in RefKeyOf<Model, BaseModel>]?: ModelType<any> | 'self'
        }
    }
}

export type StatefulQueryConfig<State extends BaseState> = <M>(state: State) => QueryConfig<M>

export interface BaseState {
    [key: string]: any
}

export class ModelQueryManager {
    static modelQueryConfigs: ModelQueryConfigs = {}

    static storeConfig<Model>(
        model: VirtualModel<Model>,
        config: QueryConfig<Model>
    ) {
        this.modelQueryConfigs[model.id] = config
    }

    static getConfig<Model>(model: VirtualModel<Model>) {
        return this.modelQueryConfigs[model.id]
    }
}

export const useQuery = <Model>(model: VirtualModel<Model>, config: QueryConfig<Model>) => {
    ModelQueryManager.storeConfig<Model>(model, config)
    return model
}
