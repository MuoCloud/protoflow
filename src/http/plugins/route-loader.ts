import { FastifyInstance, FastifyMiddleware, SimplePlugin } from 'fastify'
import { map } from 'lodash'
import { ensureArray } from '../../algorithms/collection'
import { getModulePaths } from '../../kernel/autoload'
import { RouterMethods } from '../router'

export interface RouteLoaderContext {
    routes: {
        [path: string]: RouterMethods
    }
}

export interface RouteLoaderConfig {
    rootDir: string
    prefix?: string
    removeTrailingSlash?: boolean
}

export const writeRouter = (
    app: FastifyInstance,
    path: string,
    methods: RouterMethods
) => {
    if (methods.Post) {
        app.post(path, {
            preParsing: async req => {
                Object.assign(req, { state: {} })
            },
            preValidation: ensureArray(methods.Post) as FastifyMiddleware[]
        }, () => {})
    }

    if (methods.Get) {
        app.get(path, {
            preParsing: async req => {
                Object.assign(req, { state: {} })
            },
            preValidation: ensureArray(methods.Get) as FastifyMiddleware[]
        }, () => {})
    }

    if (methods.Put) {
        app.put(path, {
            preParsing: async req => {
                Object.assign(req, { state: {} })
            },
            preValidation: ensureArray(methods.Put) as FastifyMiddleware[]
        }, () => {})
    }

    if (methods.Patch) {
        app.patch(path, {
            preParsing: async req => {
                Object.assign(req, { state: {} })
            },
            preValidation: ensureArray(methods.Patch) as FastifyMiddleware[]
        }, () => {})
    }

    if (methods.Delete) {
        app.delete(path, {
            preParsing: async req => {
                Object.assign(req, { state: {} })
            },
            preValidation: ensureArray(methods.Delete) as FastifyMiddleware[]
        }, () => {})
    }

    if (methods.Mount) {
        for (const mountRoute of methods.Mount) {
            const mountMethods = app.routes[mountRoute.routePath]
            const mountPath = mountRoute.mountPath || mountRoute.routePath

            if (!mountMethods) {
                throw new Error(`Mount path \`${mountPath}\` is not defined`)
            }

            writeRouter(app, path + mountPath, mountMethods)
        }
    }

    if (process.env.NODE_ENV === 'dev') {
        console.log(`[route] ${path}`)
    }
}

export const removeTrailingSlash = (path: string) => {
    if (path.length > 1 && path.endsWith('/')) {
        return path.substr(0, path.length - 1)
    } else {
        return path
    }
}

export const getRouteStruct = (root: string, modulePath: string) => {
    return {
        modulePath,
        path: removeTrailingSlash(
            modulePath
                .substr(root.length)
                .replace(/\/_/g, '/:')
                .replace('/index', '/')
        )
    }
}

export const routeLoader: SimplePlugin<RouteLoaderConfig> = (app, config, next) => {
    const modulePaths = getModulePaths(config.rootDir)
    const routes = map(modulePaths, path => getRouteStruct(config.rootDir, path))

    app.routes = {}

    for (const route of routes) {
        const routerMethods = require(route.modulePath) as RouterMethods
        app.routes[route.path] = routerMethods
    }

    for (const [path, methods] of Object.entries(app.routes)) {
        writeRouter(app, path, methods)
    }

    next()
}
