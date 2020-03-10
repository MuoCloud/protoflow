import Validator from 'protoflow-validator'
import { useApp } from './http/app'
import { useMiddleware } from './http/context'
import { describeMicroService, useMicroService } from './http/microservice'
import { useRouter } from './http/router'
import { requireModules } from './kernel/autoload'
import { useQuery } from './kernel/magy/model'
import { resolveQuery } from './kernel/magy/query'
import { disableModelSync, enableModelSync, useModel } from './kernel/model'
import { useMongoDB } from './kernel/mongodb'

const useValidator = () => new Validator

export {
    describeMicroService,
    disableModelSync,
    enableModelSync,
    requireModules,
    resolveQuery,
    useApp,
    useMicroService,
    useMiddleware,
    useModel,
    useMongoDB,
    useQuery,
    useRouter,
    useValidator
}
