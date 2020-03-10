"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mql_1 = require("../../kernel/mql");
const parseMQL = mql_1.getParser('object');
exports.useResolver = (resolver) => (model, options = {}) => async (req, res) => {
    var _a, _b;
    const mqlObject = (() => {
        if (req.query.mql) {
            if (req.query.mqlParseMode === 'dsl') {
                return parseMQL(req.query.mql);
            }
            else {
                return mql_1.parseJsonifiedMQL(req.query.mql);
            }
        }
        else {
            return {};
        }
    })();
    const parsedQuery = {
        skip: mqlObject.skip,
        limit: mqlObject.limit,
        filter: (_a = mqlObject.filter, (_a !== null && _a !== void 0 ? _a : {})),
        fields: (_b = mqlObject.fields, (_b !== null && _b !== void 0 ? _b : {})),
        sort: mqlObject.sort
    };
    const docs = await resolver(req, model, parsedQuery, options);
    res.send(docs);
};
