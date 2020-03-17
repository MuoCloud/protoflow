"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mql_1 = require("../mql");
const parseMQL = mql_1.getParser('object');
exports.parsedObjectToQuery = (parsedObject) => {
    var _a, _b;
    const parsedQuery = {
        skip: parsedObject.skip,
        limit: parsedObject.limit,
        filter: (_a = parsedObject.filter) !== null && _a !== void 0 ? _a : {},
        fields: (_b = parsedObject.fields) !== null && _b !== void 0 ? _b : {},
        sort: parsedObject.sort
    };
    return parsedQuery;
};
exports.buildQuery = (mql) => exports.parsedObjectToQuery(parseMQL(mql));
