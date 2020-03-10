import { FastifyInstance } from 'fastify';
export interface MicroServiceDescriberMethods {
    registerFunc: (funcName: string, cb: MicroServiceCallback) => void;
}
export declare type MicroServiceInjector = (app: FastifyInstance, path: string, token: string) => void;
export declare type MicroServiceCallback = (data: any) => Promise<any> | any;
export declare class MicroService {
    private endpoint;
    private token;
    constructor(endpoint: string, token: string);
    call<T>(funcName: string, data: any): Promise<T>;
}
export declare const useMicroService: (endpoint: string, token: string) => MicroService;
export declare const describeMicroService: (describer: (methods: MicroServiceDescriberMethods) => void) => MicroServiceInjector;
