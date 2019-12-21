import { createHash, HexBase64Latin1Encoding } from 'crypto'

export const sha1 = (str: string | Buffer, encoding: HexBase64Latin1Encoding = 'hex') =>
    createHash('sha1').update(str).digest(encoding)

export const sha256 = (str: string | Buffer, encoding: HexBase64Latin1Encoding = 'hex') =>
    createHash('sha256').update(str).digest(encoding)

export const md5 = (str: string | Buffer, encoding: HexBase64Latin1Encoding = 'hex') =>
    createHash('md5').update(str).digest(encoding)

export const passwordHash = (str: string) => sha256(str, 'base64')
