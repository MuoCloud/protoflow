import Validator from 'protoflow-validator'
import { useApp } from './http/app'
import { useMiddleware } from './http/context'
import { useQuery } from './http/mango/model'
import { useRouter } from './http/router'
import { useModules } from './kernel/autoload'
import { useModel } from './kernel/model'
import { useMongoDB } from './kernel/mongodb'
import { getParser } from './kernel/mql'

const useValidator = () => new Validator
const useMangoQueryParser = () => getParser

export {
    useApp,
    useMangoQueryParser,
    useMiddleware,
    useModel,
    useModules,
    useMongoDB,
    useQuery,
    useRouter,
    useValidator
}
