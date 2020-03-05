"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microservice_1 = require("../../kernel/microservice");
exports.microServiceLoader = (app, options, next) => {
    microservice_1.MicroService.state = {
        app,
        path: options.path
    };
    next();
};
