"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
const lodash_1 = require("lodash");
const model_1 = require("../../../kernel/magy/model");
const query_1 = require("../../../kernel/magy/query");
const middleware_1 = require("../middleware");
const buildQueryModifier = (query, projection) => ({
    expect: field => !!lodash_1.get(query.fields, field),
    include: (...fields) => {
        for (const field of fields) {
            projection[field] = 1;
        }
    },
    exclude: (...fields) => {
        for (const field of fields) {
            delete projection[field];
        }
    },
    addFilter: (field, filter) => {
        query.filter[field] = filter;
    },
    removeFilter: (...fields) => {
        query.filter = lodash_1.omit(query.filter, fields);
    },
    project: (field, projection) => {
        Object.assign(projection, {
            [field]: projection
        });
    }
});
const buildQueryReflector = (query) => ({
    expect: field => !!lodash_1.get(query.fields, field)
});
exports.dataFetcher = async (req, model, query, options) => {
    var _a;
    const queryConfig = model_1.ModelQueryManager.getConfig(model);
    const docs = await query_1.resolveQuery(model, query, {
        maxLimit: 1,
        beforeExec: async (projection) => {
            if (options.beforeResolve) {
                await options.beforeResolve(req, model, buildQueryModifier(query, projection));
            }
        }
    });
    if (Array.isArray(docs) && docs.length > 0) {
        const doc = docs[0];
        if (options.afterResolve) {
            await options.afterResolve(req, doc, buildQueryReflector(query));
        }
        return doc;
    }
    else {
        throw new http_errors_1.NotFound(`${_a = queryConfig.resourceName, (_a !== null && _a !== void 0 ? _a : 'Resource')} is not found`);
    }
};
exports.default = middleware_1.useResolver(exports.dataFetcher);
