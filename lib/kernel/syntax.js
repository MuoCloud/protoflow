"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.isNullOrUndefined = (obj) => obj === undefined || obj === null;
exports.isEmpty = (list) => list.length === 0;
exports.isNotEmpty = (arr) => {
    return arr.length > 0;
};
exports.first = (list) => list.length > 0 ? list[0] : null;
exports.last = (list) => list.length > 0 ? list[list.length - 1] : null;
exports.init = (list) => list.length > 0 ? list.slice(0, list.length - 1) : list;
exports.tail = (list) => list.length > 0 ? list.slice(1) : list;
exports.map = (list, lambda) => list.map(lambda);
exports.reduce = (list, lambda, initial) => list.reduce(lambda, initial);
const getHelper = (obj, paths) => {
    if (exports.isNullOrUndefined(obj) || !exports.isNotEmpty(paths)) {
        return obj;
    }
    const current = obj[paths.shift()];
    if (Array.isArray(current)) {
        return lodash_1.chain(current)
            .map(x => getHelper(x, [...paths]))
            .compact()
            .value();
    }
    return getHelper(current, paths);
};
exports.get = (obj, path) => getHelper(obj, path.split('.'));
