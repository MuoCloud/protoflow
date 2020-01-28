"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mql_1 = require("../../kernel/mql");
const parseMqlToJs = mql_1.getParser('jsObject');
exports.useResolver = (resolver) => (model, options = {}) => async (req, res) => {
    const mqlObject = (() => {
        if (req.query.mql) {
            if (req.query.mqlParseMode === 'js') {
                return parseMqlToJs(req.query.mql);
            }
            else {
                return mql_1.jsonToObject(req.query.mql);
            }
        }
        else {
            return {};
        }
    })();
    const parsedQuery = {
        skip: mqlObject.skip,
        limit: mqlObject.limit,
        filter: mqlObject.filter || {},
        fields: mqlObject.fields || {},
        sort: mqlObject.sort
    };
    const queryModifier = {
        expect: field => !!parsedQuery.fields[field],
        include: (...fields) => {
            for (const field of fields) {
                parsedQuery.fields[field] = 1;
            }
        },
        exclude: (...fields) => {
            parsedQuery.fields = lodash_1.omit(parsedQuery.fields, fields);
        },
        addFilter: (field, filter) => {
            parsedQuery.filter[field] = filter;
        },
        removeFilter: (...fields) => {
            parsedQuery.filter = lodash_1.omit(parsedQuery.filter, fields);
        }
    };
    if (options.beforeResolve) {
        await options.beforeResolve(req, queryModifier);
    }
    const docs = await resolver(model, parsedQuery, options);
    if (options.afterResolve) {
        await options.afterResolve(req, docs);
    }
    res.send(docs);
};
