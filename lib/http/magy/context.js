"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convert_1 = require("../../kernel/magy/convert");
const mql_1 = require("../../kernel/mql");
const parseMQL = mql_1.getParser('object');
exports.getParsedQuery = (req) => {
    const parsedObject = req.query.mql
        ? (req.query.mqlParseMode === 'dsl'
            ? parseMQL(req.query.mql)
            : mql_1.parseJsonifiedMQL(req.query.mql)) : {};
    return convert_1.parsedObjectToQuery(parsedObject);
};
