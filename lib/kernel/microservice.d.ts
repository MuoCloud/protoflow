import { FastifyInstance } from 'fastify';
export declare type MicroServiceCallback = (data: any) => Promise<any> | any;
export declare class MicroService {
    static state: {
        app: FastifyInstance;
        path: string;
        token: string;
    };
    static registerFunc(funcName: string, cb: MicroServiceCallback): void;
    private endpoint;
    private token;
    constructor(endpoint: string, token: string);
    call<T>(funcName: string, data: any): Promise<T>;
}
export declare const useMicroService: (endpoint: string, token: string) => MicroService;
export declare const registerMicroServiceFunc: (funcName: string, cb: MicroServiceCallback) => void;
