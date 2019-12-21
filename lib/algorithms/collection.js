"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.ensureArray = (value) => Array.isArray(value) ? value : [value];
exports.arrayToMap = (arr, key) => lodash_1.reduce(arr, (mapRef, item) => mapRef.set(String(item[key]), item), new Map());
