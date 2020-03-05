import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { ServiceUnavailable, Unauthorized } from 'http-errors'

export interface MicroServiceDescriberMethods {
    registerFunc: (funcName: string, cb: MicroServiceCallback) => void
}

export type MicroServiceInjector = (app: FastifyInstance, path: string, token: string) => void

export type MicroServiceCallback = (data: any) => Promise<any> | any

export class MicroService {
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

export const describeMicroService =
    (describer: (methods: MicroServiceDescriberMethods) => void): MicroServiceInjector =>
        (app, path, token) =>
            describer({
                registerFunc: (funcName, cb) => {
                    app.post(`${path}/${funcName}`, async (req, res) => {
                        if (req.headers.token !== token) {
                            throw new Unauthorized('Invalid token')
                        }

                        const result = await cb(req.body.data)

                        res.send(result)
                    })
                }
            })

