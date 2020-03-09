export type Nullable<T> = T | null
export type ArrayOr<T> = T | T[]
export type PromiseOr<T> = T | Promise<T>

export const isNullOrUndefined = <T>(obj: T) =>
    obj === undefined || obj === null

export const isEmpty = <T>(list: string | T[]) => list.length === 0
export const isNotEmpty = <T>(arr: T[]): arr is {
    pop(): T;
    shift(): T;
} & Array<T> => {
    return arr.length > 0
}

export const first = <T>(list: string | T[]) =>
    list.length > 0 ? list[0] : null

export const last = <T>(list: string | T[]) =>
    list.length > 0 ? list[list.length - 1] : null

export const init = <T>(list: string | T[]) =>
    list.length > 0 ? list.slice(0, list.length - 1) : list

export const tail = <T>(list: string | T[]) =>
    list.length > 0 ? list.slice(1) : list
