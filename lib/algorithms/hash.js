"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
exports.sha1 = (str, encoding = 'hex') => crypto_1.createHash('sha1').update(str).digest(encoding);
exports.sha256 = (str, encoding = 'hex') => crypto_1.createHash('sha256').update(str).digest(encoding);
exports.md5 = (str, encoding = 'hex') => crypto_1.createHash('md5').update(str).digest(encoding);
exports.passwordHash = (str) => exports.sha256(str, 'base64');
