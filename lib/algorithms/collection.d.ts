export declare const ensureArray: <T>(value: T | T[]) => T[];
export declare const arrayToMap: <T extends {
    [key: string]: any;
}>(arr: T[], key: keyof T) => Map<string, T>;
