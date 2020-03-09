export declare type Nullable<T> = T | null;
export declare type ArrayOr<T> = T | T[];
export declare type PromiseOr<T> = T | Promise<T>;
export declare const isNullOrUndefined: <T>(obj: T) => boolean;
export declare const isEmpty: <T>(list: string | T[]) => boolean;
export declare const isNotEmpty: <T>(arr: T[]) => arr is {
    pop(): T;
    shift(): T;
} & T[];
export declare const first: <T>(list: string | T[]) => string | T | null;
export declare const last: <T>(list: string | T[]) => string | T | null;
export declare const init: <T>(list: string | T[]) => string | T[];
export declare const tail: <T>(list: string | T[]) => string | T[];
export declare const map: <T, U>(list: T[], lambda: (x: T) => U) => U[];
export declare const reduce: <T, U>(list: T[], lambda: (prev: U, curr: T, index: number, list: T[]) => U, initial: U) => U;
export declare const get: <T>(obj: {
    [key: string]: any;
}, path: string) => T;
export declare const set: (obj: {
    [key: string]: any;
}, path: string, value: any) => any;
