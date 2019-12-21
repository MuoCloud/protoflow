"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
const lodash_1 = require("lodash");
const protoflow_validator_1 = __importDefault(require("protoflow-validator"));
exports.validator = new protoflow_validator_1.default;
const generateContextValidator = (context) => {
    const keys = Object.keys(context);
    const checkers = lodash_1.reduce(keys, (prev, key) => {
        prev[key] = exports.validator.compile(context[key]);
        return prev;
    }, {});
    return async (req) => {
        const checkerEntries = Object.entries(checkers);
        for (const [key, checker] of checkerEntries) {
            if (checker) {
                if (key === 'body' && req.body === null) {
                    throw new http_errors_1.BadRequest('Validation Error: Request must have a body');
                }
                const result = checker(req[key]);
                if (result !== true) {
                    throw new http_errors_1.BadRequest(`Validation Error: ${result[0].message}`);
                }
            }
        }
    };
};
exports.generateContextValidator = generateContextValidator;
