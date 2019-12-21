/// <reference types="node" />
import { FastifyInstance, SimplePlugin } from 'fastify';
import { RouterMethods } from '../router';
export interface RouteLoaderContext {
    routes: {
        [path: string]: RouterMethods;
    };
}
export interface RouteLoaderConfig {
    rootDir: string;
    prefix?: string;
    removeTrailingSlash?: boolean;
}
export declare const writeRouter: (app: FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>, path: string, methods: RouterMethods) => void;
export declare const removeTrailingSlash: (path: string) => string;
export declare const getRouteStruct: (root: string, modulePath: string) => {
    modulePath: string;
    path: string;
};
export declare const routeLoader: SimplePlugin<RouteLoaderConfig>;
