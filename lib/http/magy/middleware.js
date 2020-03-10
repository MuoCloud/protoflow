"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context");
exports.useResolver = (resolver) => (model, options = {}) => async (req, res) => {
    const parsedQuery = context_1.getParsedQuery(req);
    const docs = await resolver(req, model, parsedQuery, options);
    res.send(docs);
};
