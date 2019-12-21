"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotEmpty = (arr) => {
    return arr.length > 0;
};
exports.first = (list) => list.length > 0 ? list[0] : null;
exports.last = (list) => list.length > 0 ? list[list.length - 1] : null;
