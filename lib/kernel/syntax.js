"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = (obj) => obj === undefined || obj === null;
exports.isEmpty = (list) => list.length === 0;
exports.isNotEmpty = (arr) => {
    return arr.length > 0;
};
exports.first = (list) => list.length > 0 ? list[0] : null;
exports.last = (list) => list.length > 0 ? list[list.length - 1] : null;
exports.init = (list) => list.length > 0 ? list.slice(0, list.length - 1) : list;
exports.tail = (list) => list.length > 0 ? list.slice(1) : list;
