"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const collection_1 = require("../algorithms/collection");
const mongodb_1 = __importDefault(require("./mongodb"));
class VirtualModel {
    constructor(config) {
        this.aggregate = (pipeline, options) => this.collection.aggregate(pipeline, options);
        this.create = async (doc, options) => {
            if (this.config.timestamps) {
                const nowDate = new Date;
                Object.assign(doc, {
                    createdAt: nowDate,
                    updatedAt: nowDate
                });
            }
            const opResult = await this.collection.insertOne(doc, options);
            return opResult.ops[0];
        };
        this.createMany = async (docs, options) => {
            if (this.config.timestamps) {
                const nowDate = new Date;
                for (const doc of docs) {
                    Object.assign(doc, {
                        createdAt: nowDate,
                        updatedAt: nowDate
                    });
                }
            }
            const opResult = await this.collection.insertMany(docs, options);
            return opResult.ops;
        };
        this.find = (filter, projection) => this.collection.find(filter, { projection });
        this.findOne = (filter, projection) => this.collection.findOne(filter, { projection });
        this.findById = (_id, projection) => this.findOne({ _id: _id }, projection);
        this.updateOne = (filter, update, options) => {
            if (this.config.timestamps) {
                if (update.$set) {
                    Object.assign(update.$set, { updatedAt: new Date() });
                }
                else {
                    Object.assign(update, { $set: { updatedAt: new Date() } });
                }
            }
            return this.collection.updateOne(filter, update, options);
        };
        this.updateMany = (filter, update, options) => {
            if (this.config.timestamps) {
                if (update.$set) {
                    Object.assign(update.$set, { updatedAt: new Date() });
                }
                else {
                    Object.assign(update, { $set: { updatedAt: new Date() } });
                }
            }
            this.collection.updateMany(filter, update, options);
        };
        this.findOneAndUpdate = async (filter, update, options) => {
            var _a;
            if (this.config.timestamps) {
                if (update.$set) {
                    Object.assign(update.$set, { updatedAt: new Date() });
                }
                else {
                    Object.assign(update, { $set: { updatedAt: new Date() } });
                }
            }
            const result = await this.collection.findOneAndUpdate(filter, update, options);
            return _a = result.value, (_a !== null && _a !== void 0 ? _a : null);
        };
        this.deleteOne = async (filter, options) => this.collection.deleteOne(filter, options);
        this.deleteMany = async (filter, options) => this.collection.deleteMany(filter, options);
        this.findOneAndDelete = async (filter, options) => {
            var _a;
            const result = await this.collection.findOneAndDelete(filter, options);
            return _a = result.value, (_a !== null && _a !== void 0 ? _a : null);
        };
        this.countDocuments = (filter, options) => this.collection.countDocuments(filter, options);
        this.estimatedDocumentCount = (filter, options) => this.collection.estimatedDocumentCount(filter, options);
        this.populate = async (docs, options) => {
            var _a;
            if (!docs) {
                return;
            }
            if (!Array.isArray(docs)) {
                return this.populate([docs], options);
            }
            if (docs.length === 0) {
                return;
            }
            if (Array.isArray(options)) {
                for (const option of options) {
                    await this.populate(docs, option);
                }
                return;
            }
            const { path, project, model, pipe } = options;
            const refIds = lodash_1.flatMap(docs, doc => lodash_1.get(doc, path));
            const refDocs = refIds.length > 0
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
                : [];
            if (pipe) {
                await pipe(refDocs);
            }
            if (refDocs.length > 0) {
                const refDocMap = collection_1.arrayToMap(refDocs, '_id');
                for (const doc of docs) {
                    const refIds = lodash_1.get(doc, path);
                    if (!refIds) {
                        continue;
                    }
                    if (Array.isArray(refIds)) {
                        lodash_1.set(doc, path, lodash_1.map(refIds, refId => { var _a; return _a = refDocMap.get(refId.toHexString()), (_a !== null && _a !== void 0 ? _a : refId); }));
                    }
                    else {
                        lodash_1.set(doc, path, (_a = refDocMap.get(refIds.toHexString()), (_a !== null && _a !== void 0 ? _a : refIds)));
                    }
                }
            }
        };
        this.syncIndexes = async () => {
            if (this.config.indexes) {
                for (const index of this.config.indexes) {
                    await this.collection.createIndex(index[0], index[1]);
                }
            }
        };
        this.config = config;
        this.id = VirtualModel.currentId++;
        mongodb_1.default.onConnected(() => {
            if (!('sync' in this.config) || this.config.sync) {
                this.syncIndexes();
            }
        });
    }
    get collection() {
        return mongodb_1.default.client.db().collection(this.config.collection);
    }
}
exports.VirtualModel = VirtualModel;
VirtualModel.currentId = 0;
exports.useModel = (config) => new VirtualModel(config);
