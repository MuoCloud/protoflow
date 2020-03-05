import fastify, { FastifyInstance } from 'fastify'
import cors from 'fastify-cors'
import qs from 'qs'
import { microServiceLoader, MicroServiceLoaderConfig } from './plugins/microservice-loader'
import { routeLoader, RouteLoaderConfig } from './plugins/route-loader'

interface AppConfig {
    name: string
    port: number
    router: RouteLoaderConfig
    microService?: MicroServiceLoaderConfig
    address?: string
    logger?: boolean
}

export const useApp = async (
    config: AppConfig,
    lifecycle?: (app: FastifyInstance) => void | Promise<void>
) => {
    const app = fastify({
        querystringParser: qs.parse,
        logger: config.logger ?? false
    })

    if (lifecycle) {
        await lifecycle(app)
    }

    app.register(cors)
    app.register(routeLoader, config.router)
    app.register(microServiceLoader, config.microService ?? { path: '/rpc' })

    app.listen(config.port, config.address ?? '127.0.0.1', () => {
        console.log(`${config.name} is running on port ${config.port}`)
    })
}
