"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_many_1 = __importDefault(require("./resolvers/get-many"));
const get_one_1 = __importDefault(require("./resolvers/get-one"));
const wrapper = (model, resolver) => (options = {}) => resolver(model, options);
exports.default = (model) => ({
    getMany: wrapper(model, get_many_1.default),
    getOne: wrapper(model, get_one_1.default)
});
