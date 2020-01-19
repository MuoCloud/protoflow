import { ArrayOperator, CollectionAggregationOptions, CollectionInsertOneOptions, CommonOptions, Condition, FilterQuery, FindOneAndDeleteOption, FindOneAndUpdateOption, IndexOptions, MongoCountPreferences, ObjectID, QuerySelector, UpdateOneOptions, UpdateQuery } from 'mongodb';
import { MaybeArray } from './syntax';
export declare type WithId<T> = Omit<T, '_id'> & {
    readonly _id: ObjectID;
};
export declare type OptionalId<T> = Omit<T, '_id'> & {
    _id?: ObjectID;
};
export declare type CreateDocument<T> = Omit<OptionalId<T>, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
};
export declare type MongoIndexKeys<Model extends BaseModel> = {
    [key in keyof Partial<Model>]: 1 | -1 | '2d';
};
export declare type MongoIndex<Model extends BaseModel> = [MongoIndexKeys<Model>, IndexOptions?];
export interface BaseModel {
    _id?: ObjectID;
}
export interface TimestampModel extends BaseModel {
    createdAt: Date;
    updatedAt: Date;
}
export interface ModelConfig<Model extends BaseModel> {
    collection: string;
    sync?: boolean;
    indexes?: MongoIndex<Model>[];
    timestamps?: boolean;
}
export declare type ModelType<Model extends BaseModel = BaseModel> = VirtualModel<Model>;
export declare type Ref<Model extends BaseModel> = Model | ObjectID;
export declare type RefKeyOf<Model extends BaseModel, RefModel extends BaseModel> = ({
    [key in keyof Model]: Model[key] extends (Ref<RefModel> | undefined) ? key : Model[key] extends (Array<Ref<RefModel>> | undefined) ? key : never;
})[keyof Model];
export declare type ModelProject<Model extends BaseModel> = {
    [key in keyof (Partial<Model> & {
        [key: string]: any;
    })]?: 1 | 0 | QuerySelector<Model[]> | ArrayOperator<any>;
};
export interface PopulateOptions<Model extends BaseModel, RefModel extends BaseModel = any> {
    path: RefKeyOf<Omit<Model, '_id'>, RefModel>;
    project: ModelProject<RefModel>;
    model: ModelType<RefModel>;
    pipe?: (docs: RefModel[]) => void | Promise<void>;
}
export declare class VirtualModel<Model extends BaseModel> {
    static currentId: number;
    id: number;
    private config;
    constructor(config: ModelConfig<Model>);
    aggregate: (pipeline: object[], options?: CollectionAggregationOptions | undefined) => import("mongodb").AggregationCursor<Model>;
    create: (doc: OptionalId<Model> | CreateDocument<Model>, options?: CollectionInsertOneOptions | undefined) => Promise<Pick<Model, Exclude<keyof Model, "_id">> & {
        _id: Model extends {
            _id: infer U;
        } ? {} extends U ? Exclude<U, {}> : unknown extends U ? ObjectID : U : ObjectID;
    }>;
    createMany: (docs: (OptionalId<Model> | CreateDocument<Model>)[], options?: CollectionInsertOneOptions | undefined) => Promise<(Pick<Model, Exclude<keyof Model, "_id">> & {
        _id: Model extends {
            _id: infer U;
        } ? {} extends U ? Exclude<U, {}> : unknown extends U ? ObjectID : U : ObjectID;
    })[]>;
    find: (filter: FilterQuery<Model>, projection?: ModelProject<Model> | undefined) => import("mongodb").Cursor<Model>;
    findOne: (filter: FilterQuery<Model>, projection?: ModelProject<Model> | undefined) => Promise<Model | null>;
    findById: (_id: Condition<ObjectID>, projection?: ModelProject<Model> | undefined) => Promise<Model | null>;
    updateOne: (filter: FilterQuery<Model>, update: UpdateQuery<Model>, options?: UpdateOneOptions | undefined) => Promise<import("mongodb").UpdateWriteOpResult>;
    updateMany: (filter: FilterQuery<Model>, update: UpdateQuery<Model>, options?: UpdateOneOptions | undefined) => void;
    findOneAndUpdate: (filter: FilterQuery<Model>, update: UpdateQuery<Model>, options?: FindOneAndUpdateOption | undefined) => Promise<Model | null>;
    deleteOne: (filter: FilterQuery<Model>, options?: CommonOptions | undefined) => Promise<import("mongodb").DeleteWriteOpResultObject>;
    deleteMany: (filter: FilterQuery<Model>, options?: CommonOptions | undefined) => Promise<import("mongodb").DeleteWriteOpResultObject>;
    findOneAndDelete: (filter: FilterQuery<Model>, options?: FindOneAndDeleteOption | undefined) => Promise<Model | null>;
    countDocuments: (filter?: FilterQuery<Model> | undefined, options?: MongoCountPreferences | undefined) => Promise<number>;
    estimatedDocumentCount: (filter?: FilterQuery<Model> | undefined, options?: MongoCountPreferences | undefined) => Promise<number>;
    populate: <RefModel extends BaseModel>(docs: MaybeArray<Model>, options: MaybeArray<PopulateOptions<Model, RefModel>>) => Promise<void>;
    syncIndexes: () => Promise<void>;
    get collection(): import("mongodb").Collection<Model>;
}
export declare const useModel: <Model extends BaseModel>(config: ModelConfig<Model>) => VirtualModel<Model>;
