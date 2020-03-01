/// <reference types="node" />
import fastify from 'fastify';
import { RouteLoaderConfig } from './plugins/route-loader';
interface AppConfig {
    name: string;
    port: number;
    router: RouteLoaderConfig;
    address?: string;
    logger?: boolean;
}
export declare const useApp: (config: AppConfig, lifecycle?: ((app: fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>) => void | Promise<void>) | undefined) => Promise<void>;
export {};
