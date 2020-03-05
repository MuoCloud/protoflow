import { SimplePlugin } from 'fastify';
export interface MicroServiceLoaderConfig {
    rootDir: string;
    path: string;
    token: string;
}
export declare const microServiceLoader: SimplePlugin<MicroServiceLoaderConfig>;
