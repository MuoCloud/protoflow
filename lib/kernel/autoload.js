"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
exports.walkSync = (dir, fileList = []) => {
    const filepaths = fs_1.default.readdirSync(dir);
    return lodash_1.reduce(filepaths, (ref, file) => {
        if (fs_1.default.statSync(path_1.default.join(dir, file)).isDirectory()) {
            return exports.walkSync(path_1.default.join(dir, file), ref);
        }
        else if (!file.startsWith('.')) {
            return ref.concat(path_1.default.join(dir, file));
        }
        else {
            return ref;
        }
    }, fileList);
};
exports.stripSuffix = (filepath) => filepath.replace(/\.(ts|js)/g, '');
exports.getModulePaths = (dir) => lodash_1.map(exports.walkSync(dir), exports.stripSuffix);
exports.useModules = (dir) => {
    const modulePaths = exports.getModulePaths(dir);
    return lodash_1.reduce(modulePaths, (refs, file) => {
        const ref = require(file);
        return { ...refs, ...ref };
    }, {});
};
