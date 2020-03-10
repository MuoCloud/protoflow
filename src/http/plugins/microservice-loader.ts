import { SimplePlugin } from 'fastify'
import { getModulePaths } from '../../kernel/autoload'
import { MicroServiceInjector } from '../microservice'

export interface MicroServiceLoaderConfig {
    rootDir: string
    path: string
    token: string
}

export const microServiceLoader: SimplePlugin<MicroServiceLoaderConfig> =
    (app, config, next) => {
        const modulePaths = getModulePaths(config.rootDir)

        for (const modulePath of modulePaths) {
            const injector = require(modulePath) as MicroServiceInjector

            injector(app, config.path, config.token)
        }

        next()
    }
