"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const collection_1 = require("../../algorithms/collection");
const autoload_1 = require("../../kernel/autoload");
exports.writeRouter = (app, path, methods) => {
    var _a;
    if (methods.Post) {
        app.post(path, {
            preParsing: async (req) => {
                Object.assign(req, { state: {} });
            },
            preValidation: collection_1.ensureArray(methods.Post)
        }, () => { });
    }
    if (methods.Get) {
        app.get(path, {
            preParsing: async (req) => {
                Object.assign(req, { state: {} });
            },
            preValidation: collection_1.ensureArray(methods.Get)
        }, () => { });
    }
    if (methods.Put) {
        app.put(path, {
            preParsing: async (req) => {
                Object.assign(req, { state: {} });
            },
            preValidation: collection_1.ensureArray(methods.Put)
        }, () => { });
    }
    if (methods.Patch) {
        app.patch(path, {
            preParsing: async (req) => {
                Object.assign(req, { state: {} });
            },
            preValidation: collection_1.ensureArray(methods.Patch)
        }, () => { });
    }
    if (methods.Delete) {
        app.delete(path, {
            preParsing: async (req) => {
                Object.assign(req, { state: {} });
            },
            preValidation: collection_1.ensureArray(methods.Delete)
        }, () => { });
    }
    if (methods.Mount) {
        for (const mountRoute of methods.Mount) {
            const mountMethods = app.routes[mountRoute.routePath];
            const mountPath = (_a = mountRoute.mountPath) !== null && _a !== void 0 ? _a : mountRoute.routePath;
            if (!mountMethods) {
                throw new Error(`Mount path \`${mountPath}\` is not defined`);
            }
            exports.writeRouter(app, path + mountPath, mountMethods);
        }
    }
    if (process.env.NODE_ENV === 'dev') {
        console.log(`[route] ${path}`);
    }
};
exports.removeTrailingSlash = (path) => {
    if (path.length > 1 && path.endsWith('/')) {
        return path.substr(0, path.length - 1);
    }
    else {
        return path;
    }
};
exports.getRouteStruct = (root, modulePath) => {
    return {
        modulePath,
        path: exports.removeTrailingSlash(modulePath
            .substr(root.length)
            .replace(/\/_/g, '/:')
            .replace('/index', '/'))
    };
};
exports.routeLoader = (app, config, next) => {
    const modulePaths = autoload_1.getModulePaths(config.rootDir);
    const routes = lodash_1.map(modulePaths, path => exports.getRouteStruct(config.rootDir, path));
    app.routes = {};
    for (const route of routes) {
        const routerMethods = require(route.modulePath);
        app.routes[route.path] = routerMethods;
    }
    for (const [path, methods] of Object.entries(app.routes)) {
        exports.writeRouter(app, path, methods);
    }
    next();
};
