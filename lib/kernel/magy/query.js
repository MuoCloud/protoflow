"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const model_1 = require("./model");
const DEFAULT_MAX_LIMIT = 40;
exports.getModel = (model, ref) => {
    return ref === 'self' ? model : ref;
};
exports.populateByFields = async (docs, model, fields, prefix = '') => {
    const config = model_1.ModelQueryManager.getConfig(model);
    for (const field of Object.keys(fields)) {
        const fieldPath = prefix + field;
        const fieldValue = fields[field];
        if (config.fields && lodash_1.has(config.fields, fieldPath)) {
            const fieldsOrOptions = lodash_1.get(config.fields, fieldPath);
            if (fieldValue !== 1) {
                if ('model' in fieldsOrOptions) {
                    const refModel = exports.getModel(model, fieldsOrOptions.model);
                    const projection = exports.buildProjection(refModel, fieldValue);
                    await model.populate(docs, {
                        path: fieldPath,
                        project: projection,
                        model: refModel,
                        pipe: async (subDocs) => {
                            if (subDocs.length > 0) {
                                await exports.populateByFields(subDocs, refModel, fieldValue);
                            }
                        }
                    });
                }
                else {
                    await exports.populateByFields(docs, model, fieldValue, prefix + field + '.');
                }
            }
        }
    }
};
exports.buildProjection = (model, fields, prefix = '') => {
    const config = model_1.ModelQueryManager.getConfig(model);
    const projection = {};
    for (const field of Object.keys(fields)) {
        const fieldPath = prefix + field;
        const fieldValue = fields[field];
        if (config.fields && lodash_1.has(config.fields, fieldPath)) {
            const fieldsOrOptions = lodash_1.get(config.fields, fieldPath);
            if ('model' in fieldsOrOptions ||
                'excluded' in fieldsOrOptions) {
                if (!fieldsOrOptions.excluded) {
                    projection[fieldPath] = 1;
                }
            }
            else {
                if (fieldValue === 1) {
                    projection[fieldPath] = 1;
                }
                else {
                    Object.assign(projection, exports.buildProjection(model, fieldValue, prefix + field + '.'));
                }
            }
        }
        else {
            if (fieldValue === 1) {
                projection[fieldPath] = 1;
            }
            else {
                Object.assign(projection, exports.buildProjection(model, fieldValue, prefix + field + '.'));
            }
        }
    }
    return projection;
};
exports.resolveQuery = async (model, query, options = {}) => {
    var _a, _b, _c;
    const projection = exports.buildProjection(model, query.fields);
    Object.assign(projection, { _id: 1 });
    if (options.beforeExec) {
        await options.beforeExec(projection);
    }
    const docs = await model
        .aggregate([
        {
            $match: query.filter
        },
        {
            $project: projection
        },
        ...query.sort ? [{
                $sort: query.sort
            }] : []
    ])
        .skip((_a = query.skip) !== null && _a !== void 0 ? _a : 0)
        .limit((query.limit &&
        query.limit < ((_b = options.maxLimit) !== null && _b !== void 0 ? _b : DEFAULT_MAX_LIMIT))
        ? query.limit
        : ((_c = options.maxLimit) !== null && _c !== void 0 ? _c : DEFAULT_MAX_LIMIT))
        .toArray();
    if (docs.length > 0) {
        await exports.populateByFields(docs, model, query.fields);
    }
    return docs;
};
