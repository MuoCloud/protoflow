export declare type Nullable<T> = T | null;
export declare type ArrayOr<T> = T | T[];
export declare type PromiseOr<T> = T | Promise<T>;
export declare const isNullOrUndefined: <T>(obj: T) => boolean;
export declare const isEmpty: <T>(list: T[]) => boolean;
export declare const isNotEmpty: <T>(arr: T[]) => arr is {
    pop(): T;
    shift(): T;
} & T[];
export declare const first: <T>(list: T[]) => T | null;
export declare const last: <T>(list: T[]) => T | null;
export declare const init: <T>(list: T[]) => T[];
export declare const tail: <T>(list: T[]) => T[];
export declare const map: <T, U>(list: T[], lambda: (x: T) => U) => U[];
export declare const reduce: <T, U>(list: T[], lambda: (prev: U, curr: T, index: number, list: T[]) => U, initial: U) => U;
export declare const get: <T>(obj: {
    [key: string]: any;
}, path: string) => T;
