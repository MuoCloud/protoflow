import Validator from 'protoflow-validator'
import { useApp } from './http/app'
import { useMiddleware } from './http/context'
import { useQuery } from './http/magy/model'
import { useRouter } from './http/router'
import { useModules } from './kernel/autoload'
import { describeMicroService, useMicroService } from './kernel/microservice'
import { useModel } from './kernel/model'
import { useMongoDB } from './kernel/mongodb'

const useValidator = () => new Validator

export {
    describeMicroService,
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
