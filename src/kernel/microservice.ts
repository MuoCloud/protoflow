import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { ServiceUnavailable, Unauthorized } from 'http-errors'

export type RPCCallback = <T>(data: T) => Promise<void> | void
export type MicroServiceCallback = <T>(data: T) => Promise<void> | void

export class MicroService {
    static state: {
        app: FastifyInstance
        path: string,
        token: string
    }

    static registerFunc(funcName: string, cb: MicroServiceCallback) {
        this.state.app.post(`${this.state.path}/${funcName}`, async (req, res) => {
            if (req.headers.token !== this.state.token) {
                throw new Unauthorized('Invalid token')
            }

            const result = await cb(req.body.data)

            res.send(result)
        })
    }

    private endpoint: string
    private token: string

    constructor(endpoint: string, token: string) {
        this.endpoint = endpoint
        this.token = token
    }

    async call<T>(funcName: string, data: any): Promise<T> {
        try {
            const result = await axios
                .post(`${this.endpoint}/${funcName}`, { data }, {
                    headers: {
                        token: this.token
                    }
                })

            return result.data as T
        } catch (error) {
            throw new ServiceUnavailable(`Call function ${funcName} failed`)
        }
    }
}

export const useMicroService = (endpoint: string, token: string) =>
    new MicroService(endpoint, token)

export const registerMicroServiceFunc = (funcName: string, cb: MicroServiceCallback) =>
    MicroService.registerFunc(funcName, cb)
