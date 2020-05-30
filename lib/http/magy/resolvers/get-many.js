"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const query_1 = require("../../../kernel/magy/query");
const middleware_1 = require("../middleware");
exports.buildQueryModifier = (query, projection) => ({
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
exports.buildQueryReflector = (query) => ({
    expect: field => !!lodash_1.get(query.fields, field)
});
exports.dataFetcher = async (req, model, query, options) => {
    const docs = await query_1.resolveQuery(model, query, {
        maxLimit: options.maxLimit,
        beforeExec: async (projection) => {
            if (options.beforeResolve) {
                await options.beforeResolve(req, model, exports.buildQueryModifier(query, projection));
            }
        }
    });
    if (options.afterResolve) {
        await options.afterResolve(req, docs, exports.buildQueryReflector(query));
    }
    return docs;
};
exports.default = middleware_1.useResolver(exports.dataFetcher);
