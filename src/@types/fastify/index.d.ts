import fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { RouteLoaderContext } from '../../http/plugins/route-loader'

declare module 'fastify' {
  export interface FastifyInstance extends RouteLoaderContext { }

  export type SimplePlugin<T> = Plugin<Server, IncomingMessage, ServerResponse, T>
}