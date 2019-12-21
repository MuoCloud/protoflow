import { reduce } from 'lodash'

export const ensureArray = <T>(value: T | T[]) =>
    Array.isArray(value) ? value : [value]

export const arrayToMap = <T extends { [key: string]: any }>(arr: T[], key: keyof T) =>
    reduce(arr, (mapRef, item) => mapRef.set(String(item[key]), item), new Map<string, T>())
