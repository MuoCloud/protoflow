"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const collection_1 = require("../algorithms/collection");
const mongodb_1 = __importDefault(require("./mongodb"));
const syntax_1 = require("./syntax");
class VirtualModel {
    constructor(config) {
        this.initializeOrderedBulkOp = (options) => this.collection.initializeOrderedBulkOp(options);
        this.initializeUnorderedBulkOp = (options) => this.collection.initializeUnorderedBulkOp(options);
        this.aggregate = (pipeline, options) => this.collection.aggregate(pipeline, options);
        this.create = async (doc, options) => {
            if (this.config.timestamps) {
                const now = new Date;
                if (!doc.hasOwnProperty('createdAt')) {
                    Object.assign(doc, { createdAt: now });
                }
                if (!doc.hasOwnProperty('updatedAt')) {
                    Object.assign(doc, { updatedAt: now });
                }
            }
            const opResult = await this.collection
                .insertOne(doc, options);
            return opResult.ops[0];
        };
        this.createMany = async (docs, options) => {
            if (this.config.timestamps) {
                const now = new Date;
                for (const doc of docs) {
                    if (!doc.hasOwnProperty('createdAt')) {
                        Object.assign(doc, { createdAt: now });
                    }
                    if (!doc.hasOwnProperty('updatedAt')) {
                        Object.assign(doc, { updatedAt: now });
                    }
                }
            }
            const opResult = await this.collection
                .insertMany(docs, options);
            return opResult.ops;
        };
        this.find = (filter, projection) => this.collection.find(filter, { projection });
        this.findOne = (filter, projection) => this.collection.findOne(filter, { projection });
        this.findById = (_id, projection) => this.findOne({ _id: _id }, projection);
        this.updateOne = (filter, update, options) => {
            if (this.config.timestamps && (options === null || options === void 0 ? void 0 : options.updateTimestamp) !== false) {
                this.insertUpdateTimestamp(update);
            }
            return this.collection.updateOne(filter, update, options);
        };
        this.updateById = (_id, update, options) => this.updateOne({ _id: _id }, update, options);
        this.updateMany = (filter, update, options) => {
            if (this.config.timestamps && (options === null || options === void 0 ? void 0 : options.updateTimestamp) !== false) {
                this.insertUpdateTimestamp(update);
            }
            return this.collection.updateMany(filter, update, options);
        };
        this.findOneAndUpdate = async (filter, update, options) => {
            var _a;
            if (this.config.timestamps && (options === null || options === void 0 ? void 0 : options.updateTimestamp) !== false) {
                this.insertUpdateTimestamp(update);
            }
            const result = await this.collection
                .findOneAndUpdate(filter, update, options);
            return (_a = result.value) !== null && _a !== void 0 ? _a : null;
        };
        this.findByIdAndUpdate = async (_id, update, options) => this.findOneAndUpdate({ _id: _id }, update, options);
        this.deleteOne = async (filter, options) => this.collection.deleteOne(filter, options);
        this.deleteById = (_id, options) => this.deleteOne({ _id: _id }, options);
        this.deleteMany = async (filter, options) => this.collection.deleteMany(filter, options);
        this.findOneAndDelete = async (filter, options) => {
            var _a;
            const result = await this.collection
                .findOneAndDelete(filter, options);
            return (_a = result.value) !== null && _a !== void 0 ? _a : null;
        };
        this.findByIdAndDelete = async (_id, options) => this.findOneAndDelete({ _id: _id }, options);
        this.countDocuments = (filter, options) => this.collection.countDocuments(filter, options);
        this.estimatedDocumentCount = (filter, options) => this.collection.estimatedDocumentCount(filter, options);
        this.populate = async (docs, options) => {
            if (!docs) {
                return;
            }
            if (!Array.isArray(docs)) {
                return this.populate([docs], options);
            }
            if (syntax_1.isEmpty(docs)) {
                return;
            }
            if (Array.isArray(options)) {
                for (const option of options) {
                    await this.populate(docs, option);
                }
                return;
            }
            const { path, project, model, pipe } = options;
            const refIds = lodash_1.flatMap(docs, doc => syntax_1.get(doc, path));
            const refDocs = syntax_1.isNotEmpty(refIds)
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
            if (syntax_1.isNotEmpty(refDocs)) {
                const refDocMap = collection_1.arrayToMap(refDocs, '_id');
                for (const doc of docs) {
                    collection_1.traversalReplace(doc, refDocMap, path);
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
            if (VirtualModel.enabledSync &&
                (!('sync' in this.config) ||
                    this.config.sync)) {
                this.syncIndexes();
            }
        });
    }
    get collection() {
        return mongodb_1.default.client.db().collection(this.config.collection);
    }
    insertUpdateTimestamp(update) {
        if (update.$set) {
            if (!update.$set.hasOwnProperty('updatedAt')) {
                Object.assign(update.$set, {
                    updatedAt: new Date()
                });
            }
        }
        else {
            Object.assign(update, {
                $set: {
                    updatedAt: new Date()
                }
            });
        }
    }
}
exports.VirtualModel = VirtualModel;
VirtualModel.currentId = 0;
VirtualModel.enabledSync = true;
exports.disableModelSync = () => VirtualModel.enabledSync = false;
exports.enableModelSync = () => VirtualModel.enabledSync = true;
exports.useModel = (config) => new VirtualModel(config);
