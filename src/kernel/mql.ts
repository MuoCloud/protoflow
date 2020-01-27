import { chain, isPlainObject, merge } from 'lodash'
import { ObjectID } from 'mongodb'
import { isNotEmpty, MaybeArray } from './syntax'

interface Constructors {
    [name: string]: (...values: any[]) => ParsedObject | DataType
}

interface Operators {
    [name: string]: (value: any) => ParsedObject | DataType
}

interface Variables {
    [name: string]: ParsedObject | DataType
}

export interface Context {
    constructors: Constructors
    operators: Operators
    variables: Variables
}

type DataType = string | number | boolean | Date | ObjectID | null

export interface ParsedObject {
    [key: string]: MaybeArray<ParsedObject | DataType>
}

export const toBoolean = (value: string | boolean | number) => {
    if (typeof value === 'boolean') {
        return value
    } else if (typeof value === 'number') {
        return Boolean(value)
    } else {
        return value === 'true' ? true : false
    }
}

const builtinConstructors: {
    jsObject: Constructors
    json: Constructors
} = {
    jsObject: {
        Number,
        Boolean: toBoolean,
        String,
        ObjectID: (value: string) => new ObjectID(value),
        Date: (value?: string | number | Date) => value ? new Date(value) : new Date()
    },
    json: {
        Number,
        Boolean: toBoolean,
        String,
        ObjectID: (value: string) => ({ __type: 'ObjectID', value }),
        Date: (value?: string | number | Date) => ({
            __type: 'Date',
            value: value ? new Date(value) : new Date()
        })
    }
}

const builtinOperators: Operators = {
    '=': (value: any) => value,
    '!=': (value: any) => ({ $ne: value }),
    '>': (value: any) => ({ $gt: value }),
    '>=': (value: any) => ({ $gte: value }),
    '<': (value: any) => ({ $lt: value }),
    '<=': (value: any) => ({ $eq: value }),
    'in': (value: any) => ({ $in: value }),
    'exists': (value: any) => ({ $exists: value })
}

const builtinVariables: Variables = {
    'order.asc': 1,
    'order.desc': -1
}

const jsObjectDefaultContext: Context = {
    constructors: builtinConstructors.jsObject,
    operators: builtinOperators,
    variables: builtinVariables
}

const jsonObjectDefaultContext: Context = {
    constructors: builtinConstructors.json,
    operators: builtinOperators,
    variables: builtinVariables
}

export const getTokens = (query: string) => chain(query)
    .trim()
    .split(/([ \n\t"(){}:,\[\]])/g)
    .compact()
    .value()

export const isIgnored = (token: string, comma = false) =>
    token === ' ' ||
    token === '\t' ||
    token === '\n' ||
    (comma && token === ',')

export const isIdentifier = (token: string) => {
    if (token.length === 0) {
        return false
    }

    if (token === 'in' || token === 'exists') {
        return false
    }

    return /[^0-9.]/.test(token[0]) && !/[^\w$.]/g.test(token)
}

export const isNumeric = (value: any) => {
    return /^(?!-0?(\.0+)?(e|$))-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)(e-?(0|[1-9]\d*))?$/i.test(value)
}

export const OperatorParser = (
    tokens: string[],
    context: Context,
    token: string
): ParsedObject | DataType => {
    if (!(token in context.operators)) {
        throw new Error(`invalid symbol \`${token}\``)
    }

    const value = ValueParser(tokens, context)
    return context.operators[token](value)
}

export const ConstructorParser = (
    tokens: string[],
    context: Context,
    name: string
): ParsedObject | DataType => {
    if (!(name in context.constructors)) {
        throw new Error(`undefined constructor \`${name}\``)
    }

    const args = []

    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (isIgnored(token, true)) {
            continue
        }
        else if (token === ')') {
            return context.constructors[name](...args)
        }
        else {
            tokens.unshift(token)
            args.push(ValueParser(tokens, context))
        }
    }

    throw new Error('constructor is not closed')
}

export const StringParser = (tokens: string[], context: Context) => {
    let buffer = ''

    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (token === '"') {
            return context.constructors.String(buffer)
        }
        else if (token === '\\') {
            if (isNotEmpty(tokens)) {
                buffer += tokens.shift()
            }
        }
        else {
            buffer += token
        }
    }

    throw new Error('string is not closed')
}

export const ValueParser = (tokens: string[], context: Context) => {
    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (isIgnored(token)) {
            continue
        }
        else if (token === '"') {
            return StringParser(tokens, context)
        }
        else if (token === '{') {
            return BlockParser(tokens, context)
        }
        else if (token === '[') {
            return ListParser(tokens, context)
        }
        else if (token === ')') {
            tokens.unshift(token)
            return null
        }
        else if (isNumeric(token)) {
            return context.constructors.Number(token)
        }
        else if (isIdentifier(token)) {
            if (token === 'true' || token === 'false') {
                return context.constructors.Boolean(token)
            } else if (token in context.variables) {
                return context.variables[token]
            }
            else if (isNotEmpty(tokens)) {
                const nextToken = tokens.shift()

                if (nextToken === '(') {
                    return ConstructorParser(tokens, context, token)
                } else {
                    throw new Error(`undefined symbol \`${token}\``)
                }
            }
            else {
                throw new Error(`undefined symbol \`${token}\``)
            }
        }
        else {
            throw new Error(`invalid symbol \`${token}\``)
        }
    }

    throw new Error('must provide a value after assignment symbol `:`')
}

export const KeyParser = (tokens: string[], context: Context) => {
    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (isIgnored(token, true)) {
            continue
        }
        else if (token === '{' || token === '[') {
            tokens.unshift(token)
            return ValueParser(tokens, context)
        }
        else if (token === ':') {
            return ValueParser(tokens, context)
        }
        else if (token === '}' || isIdentifier(token)) {
            tokens.unshift(token)
            return 1
        }
        else  {
            return OperatorParser(tokens, context, token)
        }
    }

    return 1
}

export const ListParser = (tokens: string[], context: Context) => {
    const list: any[] = []

    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (isIgnored(token, true)) {
            continue
        }
        else if (token === ']') {
            return list
        }
        else {
            tokens.unshift(token)
            list.push(ValueParser(tokens, context))
        }
    }

    throw new Error('list is not closed')
}

export const BlockParser = (tokens: string[], context: Context) => {
    const parsedObject: ParsedObject = {}

    while (isNotEmpty(tokens)) {
        const token = tokens.shift()

        if (isIgnored(token, true)) {
            continue
        }
        else if (token === '}') {
            return parsedObject
        }
        else if (isIdentifier(token)) {
            const value = KeyParser(tokens, context)

            if (
                isPlainObject(parsedObject[token]) &&
                isPlainObject(value)
            ) {
                merge(parsedObject[token], value)
            } else {
                parsedObject[token] = value
            }
        }
        else {
            throw new Error(`invalid symbol \`${token}\``)
        }
    }

    throw new Error('block is not closed')
}

export const parseMangoQuery = (query: string, context: Context) => {
    const tokens = getTokens(query).concat('}')
    return BlockParser(tokens, context)
}

export type OutputTarget = 'jsObject' | 'jsonObject' | 'json'

export const getParser = <T extends OutputTarget>(
    target: T,
    context: Partial<Context> = {}
) => {
    const defaultContext = target === 'jsObject'
        ? jsObjectDefaultContext
        : jsonObjectDefaultContext

    const mergedContext = merge(context, defaultContext) as Context

    return (query: string) => {
        const result = parseMangoQuery(query, mergedContext)

        if (target === 'json') {
            return JSON.stringify(result) as T extends 'json' ? string : never
        } else {
            return result as T extends 'json' ? never : ParsedObject
        }
    }
}

export const jsonToObject = (mqlJson: string): ParsedObject => {
    return JSON.parse(mqlJson, (_, value) => {
        if (typeof value === 'object' && value.__type) {
            return builtinConstructors.jsObject[value.__type](value.value)
        } else {
            return value
        }
    })
}
