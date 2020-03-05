import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { ServiceUnavailable } from 'http-errors'

export type RPCCallback = <T>(data: T) => Promise<void> | void
export type MicroServiceCallback = <T>(data: T) => Promise<void> | void

export class MicroService {
    static state: {
        app: FastifyInstance
        path: string
    }

    static registerFunc(funcName: string, cb: MicroServiceCallback) {
        this.state.app.post(`${this.state.path}/${funcName}`, async (req, res) => {
            const result = await cb(req.body)

            res.send(result)
        })
    }

    private endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    async call<T>(funcName: string, data: any): Promise<T> {
        try {
            const result = await axios
                .post(`${this.endpoint}/${funcName}`, { data })

            return result.data as T
        } catch (error) {
            throw new ServiceUnavailable(`Call function ${funcName} failed`)
        }
    }
}

export const useMicroService = (endpoint: string) => new MicroService(endpoint)
export const createMicroServiceFunc = (funcName: string, cb: MicroServiceCallback) =>
    MicroService.registerFunc(funcName, cb)
