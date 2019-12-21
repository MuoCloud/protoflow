export type MaybeArray<T> = T | T[]
export type Nullable<T> = T | null

export const isNotEmpty = <T>(arr: T[]): arr is {
    pop(): T;
    shift(): T;
} & Array<T> => {
    return arr.length > 0
}

export const first = <T>(list: T[]) => list.length > 0 ? list[0] : null
export const last = <T>(list: T[]) => list.length > 0 ? list[list.length - 1] : null
