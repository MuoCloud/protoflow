import { SimplePlugin } from 'fastify';
export interface MicroServiceLoaderConfig {
    path: string;
}
export declare const microServiceLoader: SimplePlugin<MicroServiceLoaderConfig>;
