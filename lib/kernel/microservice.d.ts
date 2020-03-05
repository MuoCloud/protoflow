import { FastifyInstance } from 'fastify';
export declare type RPCCallback = <T>(data: T) => Promise<void> | void;
export declare type MicroServiceCallback = <T>(data: T) => Promise<void> | void;
export declare class MicroService {
    static state: {
        app: FastifyInstance;
        path: string;
    };
    static registerFunc(funcName: string, cb: MicroServiceCallback): void;
    private endpoint;
    constructor(endpoint: string);
    call<T>(funcName: string, data: any): Promise<T>;
}
export declare const useMicroService: (endpoint: string) => MicroService;
export declare const createMicroServiceFunc: (funcName: string, cb: MicroServiceCallback) => void;
