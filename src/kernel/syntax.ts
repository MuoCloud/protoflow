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

export const map = <T, U>(list: T[], lambda: (x: T) => U) =>
    list.map(lambda)

export const reduce = <T, U>(
    list: T[],
    lambda: (prev: U, curr: T, index: number, list: T[]) => U,
    initial: U
) =>
    list.reduce(lambda, initial)

const getHelper = (obj: { [key: string]: any }, paths: string[]): any => {
    if (isNullOrUndefined(obj) || !isNotEmpty(paths)) {
        return obj
    }

    const current = obj[paths.shift()]

    if (Array.isArray(current)) {
        return map(current, x => getHelper(x, [...paths]))
    }

    return getHelper(current, paths)
}

export const get = <T>(obj: { [key: string]: any }, path: string): T =>
    getHelper(obj, path.split('.'))

const setHelper = (obj: { [key: string]: any }, paths: string[], value: any): any => {
    if (isNullOrUndefined(obj)) {
        return
    }

    if (paths.length === 1) {
        obj[paths[0]] = value
    } else if (isNotEmpty(paths)) {
        const current = obj[paths.shift()]

        if (Array.isArray(current)) {
            for (const item of current) {
                setHelper(item, [...paths], value)
            }
        } else {
            setHelper(current, paths, value)
        }
    }
}

export const set = (obj: { [key: string]: any }, path: string, value: any) =>
    setHelper(obj, path.split('.'), value)
