"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
const syntax_1 = require("./syntax");
exports.toBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    else if (typeof value === 'number') {
        return Boolean(value);
    }
    else {
        return value === 'true' ? true : false;
    }
};
const builtinConstructors = {
    jsObject: {
        Number,
        Boolean: exports.toBoolean,
        String,
        ObjectID: (value) => new mongodb_1.ObjectID(value),
        Date: (value) => value ? new Date(value) : new Date()
    },
    json: {
        Number,
        Boolean: exports.toBoolean,
        String,
        ObjectID: (value) => ({ __type: 'ObjectID', value }),
        Date: (value) => ({
            __type: 'Date',
            value: value ? new Date(value) : new Date()
        })
    }
};
const builtinOperators = {
    '=': (value) => value,
    '!=': (value) => ({ $ne: value }),
    '>': (value) => ({ $gt: value }),
    '>=': (value) => ({ $gte: value }),
    '<': (value) => ({ $lt: value }),
    '<=': (value) => ({ $eq: value }),
    'in': (value) => ({ $in: value }),
    'exists': (value) => ({ $exists: value })
};
const builtinVariables = {
    'order.asc': 1,
    'order.desc': -1
};
const jsObjectDefaultContext = {
    constructors: builtinConstructors.jsObject,
    operators: builtinOperators,
    variables: builtinVariables
};
const jsonObjectDefaultContext = {
    constructors: builtinConstructors.json,
    operators: builtinOperators,
    variables: builtinVariables
};
exports.getTokens = (query) => lodash_1.chain(query)
    .trim()
    .split(/([ \n\t"(){}:,\[\]])/g)
    .compact()
    .value();
exports.isIgnored = (token, comma = false) => token === ' ' ||
    token === '\t' ||
    token === '\n' ||
    (comma && token === ',');
exports.isIdentifier = (token) => {
    if (token.length === 0) {
        return false;
    }
    if (token === 'in' || token === 'exists') {
        return false;
    }
    return /[^0-9.]/.test(token[0]) && !/[^\w$.]/g.test(token);
};
exports.isNumeric = (value) => {
    return /^(?!-0?(\.0+)?(e|$))-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)(e-?(0|[1-9]\d*))?$/i.test(value);
};
exports.OperatorParser = (tokens, context, token) => {
    if (!(token in context.operators)) {
        throw new Error(`invalid symbol \`${token}\``);
    }
    const value = exports.ValueParser(tokens, context);
    return context.operators[token](value);
};
exports.ConstructorParser = (tokens, context, name) => {
    if (!(name in context.constructors)) {
        throw new Error(`undefined constructor \`${name}\``);
    }
    const args = [];
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (exports.isIgnored(token, true)) {
            continue;
        }
        else if (token === ')') {
            return context.constructors[name](...args);
        }
        else {
            tokens.unshift(token);
            args.push(exports.ValueParser(tokens, context));
        }
    }
    throw new Error('constructor is not closed');
};
exports.StringParser = (tokens, context) => {
    let buffer = '';
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (token === '"') {
            return context.constructors.String(buffer);
        }
        else if (token === '\\') {
            if (syntax_1.isNotEmpty(tokens)) {
                buffer += tokens.shift();
            }
        }
        else {
            buffer += token;
        }
    }
    throw new Error('string is not closed');
};
exports.ValueParser = (tokens, context) => {
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (exports.isIgnored(token)) {
            continue;
        }
        else if (token === '"') {
            return exports.StringParser(tokens, context);
        }
        else if (token === '{') {
            return exports.BlockParser(tokens, context);
        }
        else if (token === '[') {
            return exports.ListParser(tokens, context);
        }
        else if (token === ')') {
            tokens.unshift(token);
            return null;
        }
        else if (exports.isNumeric(token)) {
            return context.constructors.Number(token);
        }
        else if (exports.isIdentifier(token)) {
            if (token === 'true' || token === 'false') {
                return context.constructors.Boolean(token);
            }
            else if (token in context.variables) {
                return context.variables[token];
            }
            else if (syntax_1.isNotEmpty(tokens)) {
                const nextToken = tokens.shift();
                if (nextToken === '(') {
                    return exports.ConstructorParser(tokens, context, token);
                }
                else {
                    throw new Error(`undefined symbol \`${token}\``);
                }
            }
            else {
                throw new Error(`undefined symbol \`${token}\``);
            }
        }
        else {
            throw new Error(`invalid symbol \`${token}\``);
        }
    }
    throw new Error('must provide a value after assignment symbol `:`');
};
exports.KeyParser = (tokens, context) => {
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (exports.isIgnored(token, true)) {
            continue;
        }
        else if (token === '{' || token === '[') {
            tokens.unshift(token);
            return exports.ValueParser(tokens, context);
        }
        else if (token === ':') {
            return exports.ValueParser(tokens, context);
        }
        else if (token === '}' || exports.isIdentifier(token)) {
            tokens.unshift(token);
            return 1;
        }
        else {
            return exports.OperatorParser(tokens, context, token);
        }
    }
    return 1;
};
exports.ListParser = (tokens, context) => {
    const list = [];
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (exports.isIgnored(token, true)) {
            continue;
        }
        else if (token === ']') {
            return list;
        }
        else {
            tokens.unshift(token);
            list.push(exports.ValueParser(tokens, context));
        }
    }
    throw new Error('list is not closed');
};
exports.BlockParser = (tokens, context) => {
    const parsedObject = {};
    while (syntax_1.isNotEmpty(tokens)) {
        const token = tokens.shift();
        if (exports.isIgnored(token, true)) {
            continue;
        }
        else if (token === '}') {
            return parsedObject;
        }
        else if (exports.isIdentifier(token)) {
            const value = exports.KeyParser(tokens, context);
            if (lodash_1.isPlainObject(parsedObject[token]) &&
                lodash_1.isPlainObject(value)) {
                lodash_1.merge(parsedObject[token], value);
            }
            else {
                parsedObject[token] = value;
            }
        }
        else {
            throw new Error(`invalid symbol \`${token}\``);
        }
    }
    throw new Error('block is not closed');
};
exports.parseMangoQuery = (query, context) => {
    const tokens = exports.getTokens(query).concat('}');
    return exports.BlockParser(tokens, context);
};
exports.getParser = (target, context = {}) => {
    const defaultContext = target === 'jsObject'
        ? jsObjectDefaultContext
        : jsonObjectDefaultContext;
    const mergedContext = lodash_1.merge(context, defaultContext);
    return (query) => {
        const result = exports.parseMangoQuery(query, mergedContext);
        if (target === 'json') {
            return JSON.stringify(result);
        }
        else {
            return result;
        }
    };
};
exports.jsonToObject = (mqlJson) => {
    return JSON.parse(mqlJson, (_, value) => {
        if (typeof value === 'object' && value.__type) {
            return builtinConstructors.jsObject[value.__type](value.value);
        }
        else {
            return value;
        }
    });
};
