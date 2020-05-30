import { ParsedObject } from 'protoflow-mql';
import { ParsedQuery } from './query';
export declare const parsedObjectToQuery: (parsedObject: ParsedObject) => ParsedQuery;
export declare const buildQuery: (mql: string) => ParsedQuery;
