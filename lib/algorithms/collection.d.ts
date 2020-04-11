export declare const ensureArray: <T>(value: T | T[]) => T[];
export declare const arrayToMap: <T extends {
    [key: string]: any;
}>(arr: T[], key: keyof T) => Map<string, T>;
export declare const traversalReplace: <T>(data: {
    [key: string]: any;
}, sourceMap: Map<string, any>, path: string) => T;
