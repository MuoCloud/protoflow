import Validator from 'protoflow-validator'
import { useApp } from './http/app'
import { useMiddleware } from './http/context'
import { useQuery } from './http/mango/model'
import { useRouter } from './http/router'
import { useModules } from './kernel/autoload'
import { createMicroServiceFunc, useMicroService } from './kernel/microservice'
import { useModel } from './kernel/model'
import { useMongoDB } from './kernel/mongodb'

const useValidator = () => new Validator

export {
    createMicroServiceFunc,
    useApp,
    useMicroService,
    useMiddleware,
    useModel,
    useModules,
    useMongoDB,
    useQuery,
    useRouter,
    useValidator
}
