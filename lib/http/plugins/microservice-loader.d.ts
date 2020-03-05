import { SimplePlugin } from 'fastify';
export interface MicroServiceLoaderConfig {
    path: string;
    token: string;
}
export declare const microServiceLoader: SimplePlugin<MicroServiceLoaderConfig>;
