"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mql_1 = require("../../kernel/mql");
exports.useResolver = (resolver) => (model, hooks = {}) => async (req, res) => {
    const mqlObject = !!req.query.mqlJson ? mql_1.jsonToObject(req.query.mqlJson) : {};
    const parsedQuery = {
        skip: mqlObject.skip,
        limit: mqlObject.limit,
        filter: mqlObject.filter || {},
        fields: mqlObject.fields || {},
        sort: mqlObject.sort
    };
    const modifier = {
        exclude: (...fields) => {
            parsedQuery.fields = lodash_1.omit(parsedQuery.fields, fields);
        },
        cond: (field, cond) => {
            parsedQuery.fields[field] = { $cond: cond };
        }
    };
    if (hooks.beforeResolve) {
        await hooks.beforeResolve(req, parsedQuery, modifier);
    }
    const docs = await resolver(model, parsedQuery);
    if (hooks.afterResolve) {
        await hooks.afterResolve(req, docs);
    }
    res.send(docs);
};
