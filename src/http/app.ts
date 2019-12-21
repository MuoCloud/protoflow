import fastify, { FastifyInstance } from 'fastify'
import cors from 'fastify-cors'
import qs from 'qs'
import { routeLoader, RouteLoaderConfig } from './plugins/route-loader'

interface AppConfig {
    name: string
    port: number
    router: RouteLoaderConfig
    logger?: boolean
}

export const useApp = async (
    config: AppConfig,
    lifecycle?: (app: FastifyInstance) => void | Promise<void>
) => {
    const app = fastify({
        querystringParser: qs.parse,
        logger: config.logger || false
    })

    if (lifecycle) {
        await lifecycle(app)
    }

    app.register(cors)
    app.register(routeLoader, config.router)

    app.listen(config.port, () => {
        console.log(`${config.name} is running on port ${config.port}`)
    })
}
