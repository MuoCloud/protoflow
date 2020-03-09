import { ArrayOr } from '../kernel/syntax';
import { Middleware, RequestContext } from './context';
import magy from './magy';
import { generateContextValidator } from './middlewares/validate-schema';
export interface MountRoute {
    routePath: string;
    mountPath?: string;
}
export interface RouterMethods {
    Post?: ArrayOr<Middleware>;
    Get?: ArrayOr<Middleware>;
    Put?: ArrayOr<Middleware>;
    Patch?: ArrayOr<Middleware>;
    Delete?: ArrayOr<Middleware>;
    Mount?: MountRoute[];
}
export declare type RouterMethod = <Context extends RequestContext = any>(...args: Middleware<Context>[]) => void;
export interface RouterProvider {
    Post: RouterMethod;
    Get: RouterMethod;
    Put: RouterMethod;
    Patch: RouterMethod;
    Delete: RouterMethod;
    Mount: (routePath: string, mountPath?: string) => void;
    Schema: typeof generateContextValidator;
    Model: typeof magy;
}
export declare const useRouter: (provider: (router: RouterProvider) => void) => RouterMethods;
