/// <reference types="node" />
import { HexBase64Latin1Encoding } from 'crypto';
export declare const sha1: (str: string | Buffer, encoding?: HexBase64Latin1Encoding) => string;
export declare const sha256: (str: string | Buffer, encoding?: HexBase64Latin1Encoding) => string;
export declare const md5: (str: string | Buffer, encoding?: HexBase64Latin1Encoding) => string;
export declare const passwordHash: (str: string) => string;
