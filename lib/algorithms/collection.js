"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const syntax_1 = require("../kernel/syntax");
exports.ensureArray = (value) => Array.isArray(value) ? value : [value];
exports.arrayToMap = (arr, key) => lodash_1.reduce(arr, (mapRef, item) => mapRef.set(String(item[key]), item), new Map());
const traversalReplaceHelper = (data, sourceMap, path) => {
    if (path.length === 1) {
        if (!syntax_1.isNullOrUndefined(data[path[0]])) {
            if (Array.isArray(data[path[0]])) {
                data[path[0]] = lodash_1.map(data[path[0]], item => sourceMap.get(String(item)));
            }
            else {
                data[path[0]] = sourceMap.get(String(data[path[0]]));
            }
        }
    }
    else if (syntax_1.isNotEmpty(path)) {
        const current = data[path.shift()];
        if (!syntax_1.isNullOrUndefined(current)) {
            if (Array.isArray(current)) {
                for (const item of current) {
                    traversalReplaceHelper(item, sourceMap, [...path]);
                }
            }
            else {
                traversalReplaceHelper(current, sourceMap, path);
            }
        }
    }
};
exports.traversalReplace = (data, sourceMap, path) => traversalReplaceHelper(data, sourceMap, path.split('.'));
