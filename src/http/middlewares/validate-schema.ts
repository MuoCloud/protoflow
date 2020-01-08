import { FastifyRequest } from 'fastify'
import { BadRequest } from 'http-errors'
import { reduce } from 'lodash'
import Validator, { ValidationRule } from 'protoflow-validator'
import { Middleware, RequestContext } from '../context'

export type ValidationSchema<T> = {
    [key in keyof T]: ValidationRule | boolean
} & {
    $$strict?: true | 'remove'
}

export type ValidationContext<T extends RequestContext> = {
    [key in keyof T]: ValidationSchema<T[key]>
}

export const validator = new Validator

type Checker = ReturnType<typeof validator['compile']>
type Checkers<T> = {
    [key in keyof T]?: Checker
}

type OptionalBase<T extends RequestContext> = Omit<T, 'state' | 'headers'> & {
    headers?: T['headers']
    state?: T['state']
}

const generateContextValidator = <T extends RequestContext>(
    context: ValidationContext<OptionalBase<T>>
): Middleware<T> => {
    const keys = Object.keys(context) as (keyof OptionalBase<T>)[]
    const checkers = reduce<(keyof OptionalBase<T>), Checkers<OptionalBase<T>>>(keys, (prev, key) => {
        prev[key] = validator.compile(context[key])
        return prev
    }, {})

    return async req => {
        const checkerEntries = Object.entries(checkers) as [keyof FastifyRequest, Checker][]

        for (const [key, checker] of checkerEntries) {
            if (checker) {
                if (key === 'body' && req.body === null) {
                    throw new BadRequest('Validation Error: Request must have a body')
                }

                const result = checker(req[key])

                if (result !== true) {
                    throw new BadRequest(`Validation Error: ${result[0].message}`)
                }
            }
        }
    }
}

export { generateContextValidator }
