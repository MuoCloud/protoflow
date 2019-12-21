import { MaybeArray } from '../kernel/syntax';
import { Middleware, RequestContext } from './context';
import mango from './mango';
import { generateContextValidator } from './middlewares/validate-schema';
export interface MountRoute {
    routePath: string;
    mountPath?: string;
}
export interface RouterMethods {
    Post?: MaybeArray<Middleware>;
    Get?: MaybeArray<Middleware>;
    Put?: MaybeArray<Middleware>;
    Patch?: MaybeArray<Middleware>;
    Delete?: MaybeArray<Middleware>;
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
    Model: typeof mango;
}
export declare const useRouter: (provider: (router: RouterProvider) => void) => RouterMethods;
