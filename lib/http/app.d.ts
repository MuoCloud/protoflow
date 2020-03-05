/// <reference types="node" />
import fastify from 'fastify';
import { MicroServiceLoaderConfig } from './plugins/microservice-loader';
import { RouteLoaderConfig } from './plugins/route-loader';
interface AppConfig {
    name: string;
    port: number;
    router: RouteLoaderConfig;
    microService?: MicroServiceLoaderConfig;
    address?: string;
    logger?: boolean;
}
export declare const useApp: (config: AppConfig, lifecycle?: ((app: fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>) => void | Promise<void>) | undefined) => Promise<void>;
export {};
