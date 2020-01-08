/// <reference path="../../../src/@types/fastify/index.d.ts" />
import Validator, { ValidationRule } from 'protoflow-validator';
import { Middleware, RequestContext } from '../context';
export declare type ValidationSchema<T> = {
    [key in keyof T]: ValidationRule | boolean;
} & {
    $$strict: true | 'remove';
};
export declare type ValidationContext<T extends RequestContext> = {
    [key in keyof T]: ValidationSchema<T[key]>;
};
export declare const validator: Validator;
declare type OptionalBase<T extends RequestContext> = Omit<T, 'state' | 'headers'> & {
    headers?: T['headers'];
    state?: T['state'];
};
declare const generateContextValidator: <T extends RequestContext<import("fastify").DefaultHeaders, import("fastify").DefaultParams, import("fastify").DefaultQuery, import("../context").DefaultBody, import("../context").DefaultState>>(context: ValidationContext<OptionalBase<T>>) => Middleware<T>;
export { generateContextValidator };
