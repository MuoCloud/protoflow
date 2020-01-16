import { flatMap, map } from 'lodash'
import {
    Collection,
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
import { arrayToMap } from '../algorithms/collection'
import MongoDB from './mongodb'
import { MaybeArray } from './syntax'

export type WithId<T> = Omit<T, '_id'> & { readonly _id: ObjectID }
export type OptionalId<T> = Omit<T, '_id'> & { _id?: ObjectID }

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

export type ModelProject<Model extends BaseModel> = {
    [key in keyof (
        Partial<Model> & {
            [key: string]: any
        }
    )]?: 1 | 0 | QuerySelector<Model[]>
}

export interface PopulateOptions<Model extends BaseModel, RefModel extends BaseModel = any> {
    path: RefKeyOf<Omit<Model, '_id'>, RefModel>
    project: ModelProject<RefModel>
    model: ModelType<RefModel>
    pipe?: (docs: RefModel[]) => void | Promise<void>
}

export class VirtualModel<Model extends BaseModel> {
    static currentId = 0

    public id: number
    private config: ModelConfig<Model>
    private collection?: Collection<Model>

    constructor(config: ModelConfig<Model>) {
        this.config = config
        this.id = VirtualModel.currentId++

        MongoDB.onConnected(() => {
            const db = MongoDB.client.db()
            this.collection = db.collection<Model>(config.collection)

            if (!('sync' in this.config) || this.config.sync) {
                this.syncIndexes()
            }
        })
    }

    aggregate = (pipeline: object[], options?: CollectionAggregationOptions) =>
        this.getContext().aggregate(pipeline, options)

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

        const opResult = await this.getContext().insertOne(doc as OptionalId<Model>, options)
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

        const opResult = await this.getContext().insertMany(docs as OptionalId<Model>[], options)
        return opResult.ops
    }

    find = (filter: FilterQuery<Model>, projection?: ModelProject<Model>) =>
        this.getContext().find(filter, { projection })

    findOne = (filter: FilterQuery<Model>, projection?: ModelProject<Model>) =>
        this.getContext().findOne(filter, { projection })

    findById = (_id: Condition<ObjectID>, projection?: ModelProject<Model>) =>
        this.findOne({ _id: _id as any }, projection)

    updateOne = (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: UpdateOneOptions
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, { updatedAt: new Date() })
            } else {
                Object.assign(update, { $set: { updatedAt: new Date() } })
            }
        }

        return this.getContext().updateOne(filter, update, options)
    }

    updateMany = (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: UpdateOneOptions
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, { updatedAt: new Date() })
            } else {
                Object.assign(update, { $set: { updatedAt: new Date() } })
            }
        }

        this.getContext().updateMany(filter, update, options)
    }

    findOneAndUpdate = async (
        filter: FilterQuery<Model>,
        update: UpdateQuery<Model>,
        options?: FindOneAndUpdateOption
    ) => {
        if (this.config.timestamps) {
            if (update.$set) {
                Object.assign(update.$set, { updatedAt: new Date() })
            } else {
                Object.assign(update, { $set: { updatedAt: new Date() } })
            }
        }

        const result = await this.getContext().findOneAndUpdate(filter, update, options)
        return result.value || null
    }

    deleteOne = async (filter: FilterQuery<Model>, options?: CommonOptions) =>
        this.getContext().deleteOne(filter, options)

    deleteMany = async (filter: FilterQuery<Model>, options?: CommonOptions) =>
        this.getContext().deleteMany(filter, options)

    findOneAndDelete = async (filter: FilterQuery<Model>, options?: FindOneAndDeleteOption) => {
        const result = await this.getContext().findOneAndDelete(filter, options)
        return result.value || null
    }

    countDocuments = (filter?: FilterQuery<Model>, options?: MongoCountPreferences) =>
        this.getContext().countDocuments(filter, options)

    estimatedDocumentCount = (filter?: FilterQuery<Model>, options?: MongoCountPreferences) =>
        this.getContext().estimatedDocumentCount(filter, options)

    populate = async <RefModel extends BaseModel>(
        docs: MaybeArray<Model>,
        options: MaybeArray<PopulateOptions<Model, RefModel>>
    ): Promise<void> => {
        this.getContext()

        if (!Array.isArray(docs)) {
            return this.populate([docs], options)
        }

        if (docs.length === 0) {
            return
        }

        if (Array.isArray(options)) {
            for (const option of options) {
                await this.populate(docs, option)
            }

            return
        }

        const { path, project, model, pipe } = options

        const refIds = flatMap(docs, doc => doc[path]) as ObjectID[]
        const refDocs = await model.aggregate([
            {
                $match: {
                    _id: {
                        $in: refIds
                    }
                }
            },
            {
                $project: project
            }
        ]).toArray()

        if (pipe) {
            await pipe(refDocs)
        }

        const refDocMap = arrayToMap(refDocs, '_id')

        for (const doc of docs) {
            const refIds = doc[path] as MaybeArray<ObjectID>

            if (Array.isArray(refIds)) {
                doc[path] = map(refIds, refId => {
                    const ref = refDocMap.get(refId.toHexString())
                    return ref || refId
                }) as any
            } else {
                const ref = refDocMap.get(refIds.toHexString())
                doc[path] = (ref || refIds) as any
            }
        }
    }

    syncIndexes = async () => {
        const collecton = this.getContext()

        if (this.config.indexes) {
            for (const index of this.config.indexes) {
                await collecton.createIndex(index[0], index[1])
            }
        }
    }

    getContext = () => {
        if (!this.collection) {
            throw new Error('Not connected')
        }

        return this.collection
    }
}

export const useModel = <Model extends BaseModel>(config: ModelConfig<Model>) =>
    new VirtualModel<Model>(config)
