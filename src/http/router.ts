import { MaybeArray } from '../kernel/syntax'
import { Middleware, RequestContext } from './context'
import mango from './mango'
import { generateContextValidator } from './middlewares/validate-schema'

export interface MountRoute {
    routePath: string
    mountPath?: string
}

export interface RouterMethods {
    Post?: MaybeArray<Middleware>
    Get?: MaybeArray<Middleware>
    Put?: MaybeArray<Middleware>
    Patch?: MaybeArray<Middleware>
    Delete?: MaybeArray<Middleware>

    Mount?: MountRoute[]
}

export type RouterMethod = <Context extends RequestContext = any>(
    ...args: Middleware<Context>[]
) => void

export interface RouterProvider {
    Post: RouterMethod
    Get: RouterMethod
    Put: RouterMethod
    Patch: RouterMethod
    Delete: RouterMethod

    Mount: (routePath: string, mountPath?: string) => void

    Schema: typeof generateContextValidator
    Model: typeof mango
}

const getDefinedMethod = (
    definedMethods: RouterMethods,
    type: 'Post' | 'Get' | 'Put' | 'Patch' | 'Delete'
): RouterMethod =>
    (...middlewares) => {
        definedMethods[type] = middlewares
    }

export const useRouter = (provider: (router: RouterProvider) => void) => {
    const definedMethods: RouterMethods = {
        Mount: []
    }

    provider({
        Post: getDefinedMethod(definedMethods, 'Post'),
        Get: getDefinedMethod(definedMethods, 'Get'),
        Put: getDefinedMethod(definedMethods, 'Put'),
        Patch: getDefinedMethod(definedMethods, 'Patch'),
        Delete: getDefinedMethod(definedMethods, 'Delete'),
        Mount: (routePath: string, mountPath?: string) => {
            if (!definedMethods.Mount) {
                definedMethods.Mount = []
            }

            definedMethods.Mount.push({
                routePath,
                mountPath
            })
        },
        Schema: generateContextValidator,
        Model: mango
    })

    return definedMethods
}

