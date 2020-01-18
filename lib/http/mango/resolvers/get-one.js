"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
const middleware_1 = require("../middleware");
const model_1 = require("../model");
const get_many_1 = require("./get-many");
exports.default = middleware_1.useResolver(async (model, query, hooks) => {
    const queryConfig = model_1.ModelQueryManager.getConfig(model);
    query.limit = 1;
    const docs = await get_many_1.dataFetcher(model, query, hooks);
    if (Array.isArray(docs) && docs.length > 0) {
        return docs[0];
    }
    else {
        throw new http_errors_1.NotFound(`${queryConfig.resourceName || 'Resource'} is not found`);
    }
});
