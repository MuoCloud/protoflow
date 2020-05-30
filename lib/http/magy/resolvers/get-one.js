"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
const model_1 = require("../../../kernel/magy/model");
const query_1 = require("../../../kernel/magy/query");
const middleware_1 = require("../middleware");
const get_many_1 = require("./get-many");
exports.dataFetcher = async (req, model, query, options) => {
    var _a;
    const queryConfig = model_1.ModelQueryManager.getConfig(model);
    if (options._id) {
        query.filter._id = options._id(req);
    }
    const docs = await query_1.resolveQuery(model, query, {
        maxLimit: 1,
        beforeExec: async (projection) => {
            if (options.beforeResolve) {
                await options.beforeResolve(req, model, get_many_1.buildQueryModifier(query, projection));
            }
        }
    });
    if (Array.isArray(docs) && docs.length > 0) {
        const doc = docs[0];
        if (options.afterResolve) {
            await options.afterResolve(req, doc, get_many_1.buildQueryReflector(query));
        }
        return doc;
    }
    else {
        throw new http_errors_1.NotFound(`${(_a = queryConfig.resourceName) !== null && _a !== void 0 ? _a : 'Resource'} is not found`);
    }
};
exports.default = middleware_1.useResolver(exports.dataFetcher);
