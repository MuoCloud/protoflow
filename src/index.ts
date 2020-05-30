import { getParser } from 'protoflow-mql'
import Validator from 'protoflow-validator'
import { useApp } from './http/app'
import { useMiddleware } from './http/context'
import { describeMicroService, useMicroService } from './http/microservice'
import { useRouter } from './http/router'
import { requireModules } from './kernel/autoload'
import { parsedObjectToQuery } from './kernel/magy/convert'
import { useQuery } from './kernel/magy/model'
import { populateByFields, resolveQuery } from './kernel/magy/query'
import { disableModelSync, enableModelSync, useModel } from './kernel/model'
import { useMongoDB } from './kernel/mongodb'

const parseMQL = getParser('object')

const useMQL = (mql: string) => parsedObjectToQuery(parseMQL(mql))
const useValidator = () => new Validator

export {
    describeMicroService,
    disableModelSync,
    enableModelSync,
    populateByFields,
    requireModules,
    resolveQuery,
    useApp,
    useMicroService,
    useMiddleware,
    useModel,
    useMongoDB,
    useMQL,
    useQuery,
    useRouter,
    useValidator
}
