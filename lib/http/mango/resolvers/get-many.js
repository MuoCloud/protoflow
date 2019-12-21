"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const middleware_1 = require("../middleware");
const model_1 = require("../model");
exports.getModel = (model, ref) => {
    return ref === 'self' ? model : ref;
};
exports.reduceFields = (model, fields, prefix = '') => {
    const config = model_1.ModelQueryManager.getConfig(model);
    const refModels = config.fields ? config.fields.populateModel : {};
    return lodash_1.reduce(Object.keys(fields), (reduced, field) => {
        if (fields[field] === 1 || field in refModels) {
            if (prefix !== '') {
                reduced[`${prefix}.${field}`] = 1;
            }
            else {
                reduced[field] = 1;
            }
        }
        else {
            Object.assign(reduced, exports.reduceFields(model, fields[field], prefix + field));
        }
        return reduced;
    }, {});
};
exports.buildPopulateOptions = (model, fields) => {
    const config = model_1.ModelQueryManager.getConfig(model);
    const populateOptions = [];
    if (config.fields && config.fields.populateModel) {
        const refModels = config.fields.populateModel;
        for (const field of Object.keys(fields)) {
            if (fields[field] !== 1) {
                if (field in refModels) {
                    const nextFields = fields[field];
                    const reducedFields = exports.reduceFields(model, nextFields);
                    const refModel = exports.getModel(model, refModels[field]);
                    Object.assign(reducedFields, { _id: 1 });
                    populateOptions.push({
                        path: field,
                        project: reducedFields,
                        model: refModel,
                        pipe: async (docs) => {
                            const options = exports.buildPopulateOptions(refModel, nextFields);
                            if (options.length > 0) {
                                await refModel.populate(docs, options);
                            }
                        }
                    });
                }
            }
        }
    }
    return populateOptions;
};
exports.dataPopulator = async (docs, model, fields) => {
    await model.populate(docs, exports.buildPopulateOptions(model, fields));
};
exports.dataFetcher = async (model, query) => {
    const queryConfig = model_1.ModelQueryManager.getConfig(model);
    if (queryConfig.fields && queryConfig.fields.exclude) {
        query.fields = lodash_1.omit(query.fields, queryConfig.fields.exclude);
    }
    const reducedFields = exports.reduceFields(model, query.fields);
    Object.assign(reducedFields, { _id: 1 });
    const docs = await model
        .aggregate([
        {
            $match: query.filter
        },
        {
            $project: reducedFields
        }
    ])
        .skip(query.skip)
        .limit(query.limit)
        .toArray();
    await exports.dataPopulator(docs, model, query.fields);
    return docs;
};
exports.default = middleware_1.useResolver(exports.dataFetcher);
