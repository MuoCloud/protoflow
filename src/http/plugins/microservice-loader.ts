import { SimplePlugin } from 'fastify'
import { MicroService } from '../../kernel/microservice'

export interface MicroServiceLoaderConfig {
    path: string
    token: string
}

export const microServiceLoader: SimplePlugin<MicroServiceLoaderConfig> =
    (app, options, next) => {
        MicroService.state = {
            app,
            path: options.path,
            token: options.token
        }

        next()
    }
