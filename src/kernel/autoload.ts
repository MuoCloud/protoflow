import fs from 'fs'
import { map, reduce } from 'lodash'
import path from 'path'

export const walkSync = (dir: string, fileList: string[] = []): string[] => {
    const filepaths = fs.readdirSync(dir)

    return reduce(filepaths, (ref, file) => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            return walkSync(path.join(dir, file), ref)
        } else if (!file.startsWith('.')) {
            return ref.concat(path.join(dir, file))
        } else {
            return ref
        }
    }, fileList)
}

export const stripSuffix = (filepath: string) => filepath.replace(/\.(ts|js)/g, '')

export const getModulePaths = (dir: string) => map(walkSync(dir), stripSuffix)

export const requireModules = (dir: string) => {
    const modulePaths = getModulePaths(dir)

    return reduce(modulePaths, (refs, file) => {
        const ref = require(file)
        return { ...refs, ...ref }
    }, {})
}
