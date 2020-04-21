import { flatMap } from 'lodash'
import {
    ArrayOperator,
    CollectionAggregationOptions,
    CollectionInsertOneOptions,
    CommonOptions,
    Condition,
    FilterQuery,
    FindOneAndDeleteOption,
    FindOneAndUpdateOption,
    IndexOptions,
    MongoCountPreferences,
    ObjectID,
    QuerySelector,
    UpdateOneOptions,
    UpdateQuery
} from 'mongodb'
import { arrayToMap, traversalReplace } from '../algorithms/collection'
import MongoDB from './mongodb'
import { ArrayOr, get, isEmpty, isNotEmpty, PromiseOr } from './syntax'

export type EnhancedOmit<T, K extends string | number | symbol> =
    string | number extends keyof T ? T :
    Omit<T, K>

export type ExtractIdType<TSchema> =
    TSchema extends { _id: infer U }
    ? {} extends U ? Exclude<U, {}> :
    unknown extends U ? ObjectID : U
    : ObjectID

export type OptionalId<TSchema extends { _id?: any }> =
    ObjectID extends TSchema['_id']
    ? EnhancedOmit<TSchema, '_id'> & { _id?: ExtractIdType<TSchema> }
    : WithId<TSchema>

export type WithId<TSchema> = EnhancedOmit<TSchema, '_id'> & { _id: ExtractIdType<TSchema> }

export type CreateDocument<T> = Omit<OptionalId<T>, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date
    updatedAt?: Date
}

export type MongoIndexKeys<Model extends BaseModel> = { [key in keyof Partial<Model>]: 1 | -1 | '2d' }
export type MongoIndex<Model extends BaseModel> = [MongoIndexKeys<Model>, IndexOptions?]

export interface BaseModel {
    _id?: ObjectID
}

export interface TimestampModel extends BaseModel {
    createdAt: Date
    updatedAt: Date
}

export interface ModelConfig<Model extends BaseModel> {
    collection: string
    sync?: boolean
    indexes?: MongoIndex<Model>[]
    timestamps?: boolean
}

export type ModelType<Model extends BaseModel = BaseModel> = VirtualModel<Model>

export type Ref<Model extends BaseModel> = Model | ObjectID
export type RefKeyOf<Model extends BaseModel, RefModel extends BaseModel> = ({
    [key in keyof Model]: Model[key] extends (Ref<RefModel> | undefined) ? key : Model[key] extends (Array<Ref<RefModel>> | undefined) ? key : never
})[keyof Model]

export type Projection<Model extends BaseModel> = {
    [key in keyof (
        Partial<Model> & {
            [key: string]: any
        }
    )]?: 1 | 0 | QuerySelector<Model[]> | ArrayOperator<any>
}

export interface PopulateOptions<Model extends BaseModel, RefModel extends BaseModel = any> {
    path: RefKeyOf<Omit<Model, '_id'>, RefModel> & string
    project: Projection<RefModel> | 'all'
    model: ModelType<RefModel>
    pipe?: (docs: RefModel[]) => PromiseOr<void>
}

export class VirtualModel<Model extends BaseModel> {
    static currentId = 0
    static enabledSync = true

    public id: number
    private config: ModelConfig<Model>

    constructor(config: ModelConfig<Model>) {
        this.config = config
        this.id = VirtualModel.currentId++

        MongoDB.onConnected(() => {
            if (
                VirtualModel.enabledSync &&
                (
                    !('sync' in this.config) ||
                    this.config.sync
                )
            ) {
                this.syncIndexes()
            }
        })
    }

    initializeOrderedBulkOp = (options?: CommonOptions) =>
        this.collection.initializeOrderedBulkOp(options)

    initializeUnorderedBulkOp = (options?: CommonOptions) =>
        this.collection.initializeUnorderedBulkOp(options)

    aggregate = (
        pipeline: object[],
        options?: CollectionAggregationOptions
    ) =>
        this.collection.aggregate(pipeline, options)

    create = async (
        doc: OptionalId<Model> | CreateDocument<Model>,
        options?: CollectionInsertOneOptions
    ) => {
        if (this.config.timestamps) {
            const nowDate = new Date

            Object.assign(doc, {
                createdAt: nowDate,
                updatedAt: nowDate
            })
        }

        const opResult = await this.collection
            .insertOne(doc as OptionalId<Model>, options)

        return opResult.ops[0]
    }

    createMany = async (
        docs: (OptionalId<Model> | CreateDocument<Model>)[],
        options?: CollectionInsertOneOptions
    ) => {
        if (this.config.timestamps) {
            const nowDate = new Date

            for (const doc of docs) {
                Object.assign(doc, {
                    createdAt: nowDate,
                    updatedAt: nowDate
                })
            }
        }

        const opResult = await this.collection
            .insertMany(docs as OptionalId<Model>[], options)

        return opResult.ops
    }

    find = (
        filter: FilterQuery<Model>,
        projection?: Projection<Model>
    ) =>
        this.collection.find(filter, { projection })

    findOne = (
        filter: FilterQuery<Model>,
        projection?: Projection<Model>
    ) =>
        this.collection.findOne(filter, { projection })

    findById = (
        _id: Condition<ObjectID>,
        projection?: Projection<Model>
    ) =>
        this.findOne({ _id: _id as any }, projection)

    updateOne = (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: UpdateOneOptions
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, {
                    updatedAt: new Date()
                })
            } else {
                Object.assign(update, {
                    $set: {
                        updatedAt: new Date()
                    }
                })
            }
        }

        return this.collection.updateOne(filter, update, options)
    }

    updateById = (
        _id: Condition<ObjectID>,
        update: UpdateQuery<Model>,
        options?: UpdateOneOptions
    ) =>
        this.updateOne({ _id: _id as any }, update, options)

    updateMany = (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: UpdateOneOptions
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, {
                    updatedAt: new Date()
                })
            } else {
                Object.assign(update, {
                    $set: {
                        updatedAt: new Date()
                    }
                })
            }
        }

        return this.collection.updateMany(filter, update, options)
    }

    findOneAndUpdate = async (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: FindOneAndUpdateOption
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, {
                    updatedAt: new Date()
                })
            } else {
                Object.assign(update, {
                    $set: {
                        updatedAt: new Date()
                    }
                })
            }
        }

        const result = await this.collection
            .findOneAndUpdate(filter, update, options)

        return result.value ?? null
    }

    findByIdAndUpdate = async (
        _id: Condition<ObjectID>,
        update: UpdateQuery<Model>,
        options?: FindOneAndUpdateOption
    ) =>
        this.findOneAndUpdate({ _id: _id as any }, update, options)

    deleteOne = async (
        filter: FilterQuery<Model>,
        options?: CommonOptions
    ) =>
        this.collection.deleteOne(filter, options)

    deleteMany = async (
        filter: FilterQuery<Model>,
        options?: CommonOptions
    ) =>
        this.collection.deleteMany(filter, options)

    findOneAndDelete = async (
        filter: FilterQuery<Model>,
        options?: FindOneAndDeleteOption
    ) => {
        const result = await this.collection
            .findOneAndDelete(filter, options)

        return result.value ?? null
    }

    findByIdAndDelete = async (
        _id: Condition<ObjectID>,
        options?: FindOneAndDeleteOption
    ) =>
        this.findOneAndDelete({ _id: _id as any }, options)

    countDocuments = (
        filter?: FilterQuery<Model>,
        options?: MongoCountPreferences
    ) =>
        this.collection.countDocuments(filter, options)

    estimatedDocumentCount = (
        filter?: FilterQuery<Model>,
        options?: MongoCountPreferences
    ) =>
        this.collection.estimatedDocumentCount(filter, options)

    populate = async <RefModel extends BaseModel>(
        docs: ArrayOr<Model>,
        options: ArrayOr<PopulateOptions<Model, RefModel>>
    ): Promise<void> => {
        if (!docs) {
            return
        }

        if (!Array.isArray(docs)) {
            return this.populate([docs], options)
        }

        if (isEmpty(docs)) {
            return
        }

        if (Array.isArray(options)) {
            for (const option of options) {
                await this.populate(docs, option)
            }

            return
        }

        const { path, project, model, pipe } = options

        const refIds = flatMap(docs, doc => get(doc, path)) as any as ObjectID[]
        const refDocs = isNotEmpty(refIds)
            ? await model
                .aggregate([
                    {
                        $match: {
                            _id: {
                                $in: refIds
                            }
                        }
                    },
                    ...project !== 'all' ? [{
                        $project: project
                    }] : []
                ])
                .toArray()
            : []

        if (pipe) {
            await pipe(refDocs)
        }

        if (isNotEmpty(refDocs)) {
            const refDocMap = arrayToMap(refDocs, '_id')

            for (const doc of docs) {
                traversalReplace(doc, refDocMap, path)
            }
        }
    }

    syncIndexes = async () => {
        if (this.config.indexes) {
            for (const index of this.config.indexes) {
                await this.collection.createIndex(index[0], index[1])
            }
        }
    }

    get collection() {
        return MongoDB.client.db().collection<Model>(this.config.collection)
    }
}

export const disableModelSync = () => VirtualModel.enabledSync = false
export const enableModelSync = () => VirtualModel.enabledSync = true

export const useModel = <Model extends BaseModel>(config: ModelConfig<Model>) =>
    new VirtualModel<Model>(config)
