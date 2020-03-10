import { ObjectID } from 'mongodb';
import { ArrayOr } from './syntax';
interface Constructors {
    [name: string]: (...values: any[]) => ParsedObject | DataType;
}
interface Operators {
    [name: string]: (value: any) => ParsedObject | DataType;
}
interface Variables {
    [name: string]: ParsedObject | DataType;
}
export interface Context {
    constructors: Constructors;
    operators: Operators;
    variables: Variables;
}
declare type DataType = string | number | boolean | Date | ObjectID | null;
export interface ParsedObject {
    [key: string]: ArrayOr<ParsedObject | DataType>;
}
export declare const toBoolean: (value: string | number | boolean) => boolean;
export declare const getTokens: (query: string) => string[];
export declare const isIgnored: (token: string, comma?: boolean) => boolean;
export declare const isIdentifier: (token: string) => boolean;
export declare const isNumeric: (value: any) => boolean;
export declare const OperatorParser: (tokens: string[], context: Context, token: string) => string | number | boolean | Date | ObjectID | ParsedObject | null;
export declare const ConstructorParser: (tokens: string[], context: Context, name: string) => string | number | boolean | Date | ObjectID | ParsedObject | null;
export declare const StringParser: (tokens: string[], context: Context) => string | number | boolean | Date | ObjectID | ParsedObject | null;
export declare const ValueParser: (tokens: string[], context: Context) => string | number | boolean | any[] | Date | ObjectID | ParsedObject | null;
export declare const KeyParser: (tokens: string[], context: Context) => string | number | boolean | any[] | Date | ObjectID | ParsedObject | null;
export declare const ListParser: (tokens: string[], context: Context) => any[];
export declare const BlockParser: (tokens: string[], context: Context) => ParsedObject;
export declare const parseMQL: (query: string, context: Context) => ParsedObject;
export declare type OutputTarget = 'object' | 'json';
export declare const getParser: <T extends OutputTarget>(target: T, context?: Partial<Context>) => (query: string) => (T extends "json" ? string : never) | (T extends "json" ? never : ParsedObject);
export declare const parseJsonifiedMQL: (mqlJson: string) => ParsedObject;
export {};
