export declare type MaybeArray<T> = T | T[];
export declare type Nullable<T> = T | null;
export declare const isNotEmpty: <T>(arr: T[]) => arr is {
    pop(): T;
    shift(): T;
} & T[];
export declare const first: <T>(list: T[]) => T | null;
export declare const last: <T>(list: T[]) => T | null;
