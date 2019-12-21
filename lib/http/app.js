"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const qs_1 = __importDefault(require("qs"));
const route_loader_1 = require("./plugins/route-loader");
exports.useApp = async (config, lifecycle) => {
    const app = fastify_1.default({
        querystringParser: qs_1.default.parse,
        logger: config.logger || false
    });
    if (lifecycle) {
        await lifecycle(app);
    }
    app.register(fastify_cors_1.default);
    app.register(route_loader_1.routeLoader, config.router);
    app.listen(config.port, () => {
        console.log(`${config.name} is running on port ${config.port}`);
    });
};
