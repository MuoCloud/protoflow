"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const magy_1 = __importDefault(require("./magy"));
const validate_schema_1 = require("./middlewares/validate-schema");
const getDefinedMethod = (definedMethods, type) => (...middlewares) => {
    definedMethods[type] = middlewares;
};
exports.useRouter = (provider) => {
    const definedMethods = {
        Mount: []
    };
    provider({
        Post: getDefinedMethod(definedMethods, 'Post'),
        Get: getDefinedMethod(definedMethods, 'Get'),
        Put: getDefinedMethod(definedMethods, 'Put'),
        Patch: getDefinedMethod(definedMethods, 'Patch'),
        Delete: getDefinedMethod(definedMethods, 'Delete'),
        Mount: (routePath, mountPath) => {
            if (!definedMethods.Mount) {
                definedMethods.Mount = [];
            }
            definedMethods.Mount.push({
                routePath,
                mountPath
            });
        },
        Schema: validate_schema_1.generateContextValidator,
        Model: magy_1.default
    });
    return definedMethods;
};
