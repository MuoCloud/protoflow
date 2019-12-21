import {
    DefaultHeaders,
    DefaultParams,
    DefaultQuery,
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'

export interface DefaultState { [k: string]: any }
export interface DefaultBody { [k: string]: any }

export interface RequestContext<Headers = DefaultHeaders, Params = DefaultParams, Query = DefaultQuery, Body = DefaultBody, State = DefaultState> {
    headers?: Headers
    params?: Params
    query?: Query
    body?: Body
    state?: State
}

export type Request<Context extends RequestContext = any> = FastifyRequest<
    IncomingMessage,
    Context['query'] & DefaultQuery,
    Context['params'] & DefaultParams,
    Context['headers'] & DefaultHeaders,
    Context['body'] & DefaultBody
> & { state: Context['state'] }

export type Middleware<Context extends RequestContext = any> = (
    this: FastifyInstance<Server, IncomingMessage, ServerResponse>,
    req: Request<Context>,
    reply: FastifyReply<ServerResponse>,
    done: (err?: Error) => void
) => Promise<void>

export const useMiddleware = <Context = any>(middleware: Middleware<Context>) => middleware
