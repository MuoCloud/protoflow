"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoload_1 = require("../../kernel/autoload");
exports.microServiceLoader = (app, config, next) => {
    const modulePaths = autoload_1.getModulePaths(config.rootDir);
    for (const modulePath of modulePaths) {
        const injector = require(modulePath);
        injector(app, config.path, config.token);
    }
    next();
};
