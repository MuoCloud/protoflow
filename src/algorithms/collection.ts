import { map, reduce } from 'lodash'
import { isNotEmpty, isNullOrUndefined } from '../kernel/syntax'

export const ensureArray = <T>(value: T | T[]) =>
    Array.isArray(value) ? value : [value]

export const arrayToMap = <T extends { [key: string]: any }>(arr: T[], key: keyof T) =>
    reduce(arr, (mapRef, item) => mapRef.set(String(item[key]), item), new Map<string, T>())

const traversalReplaceHelper = (
    data: { [key: string]: any },
    sourceMap: Map<string, any>,
    path: string[]
): any => {
    if (path.length === 1) {
        if (!isNullOrUndefined(data[path[0]])) {
            if (Array.isArray(data[path[0]])) {
                data[path[0]] = map(data[path[0]], item => sourceMap.get(String(item)))
            } else {
                data[path[0]] = sourceMap.get(String(data[path[0]]))
            }
        }
    } else if (isNotEmpty(path)) {
        const current = data[path.shift()]

        if (!isNullOrUndefined(current)) {
            if (Array.isArray(current)) {
                for (const item of current) {
                    traversalReplaceHelper(item, sourceMap, [...path])
                }
            } else {
                traversalReplaceHelper(current, sourceMap, path)
            }
        }
    }
}

export const traversalReplace = <T>(
    data: { [key: string]: any },
    sourceMap: Map<string, any>,
    path: string
): T =>
    traversalReplaceHelper(data, sourceMap, path.split('.'))
