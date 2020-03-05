"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const qs_1 = __importDefault(require("qs"));
const microservice_loader_1 = require("./plugins/microservice-loader");
const route_loader_1 = require("./plugins/route-loader");
exports.useApp = async (config, lifecycle) => {
    var _a, _b;
    const app = fastify_1.default({
        querystringParser: qs_1.default.parse,
        logger: (_a = config.logger, (_a !== null && _a !== void 0 ? _a : false))
    });
    app.register(fastify_cors_1.default);
    app.register(route_loader_1.routeLoader, config.router);
    if (config.microService) {
        app.register(microservice_loader_1.microServiceLoader, config.microService);
    }
    if (lifecycle) {
        await lifecycle(app);
    }
    const props = {
        name: config.name,
        port: config.port,
        address: (_b = config.address, (_b !== null && _b !== void 0 ? _b : '127.0.0.1'))
    };
    app.listen(props.port, props.address, () => {
        console.log(`${props.name} is running on ${props.address}:${props.port}`);
    });
};
