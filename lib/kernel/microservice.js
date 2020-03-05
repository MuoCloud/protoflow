"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const http_errors_1 = require("http-errors");
class MicroService {
    constructor(endpoint, token) {
        this.endpoint = endpoint;
        this.token = token;
    }
    async call(funcName, data) {
        try {
            const result = await axios_1.default
                .post(`${this.endpoint}/${funcName}`, { data }, {
                headers: {
                    token: this.token
                }
            });
            return result.data;
        }
        catch (error) {
            throw new http_errors_1.ServiceUnavailable(`Call function ${funcName} failed`);
        }
    }
}
exports.MicroService = MicroService;
exports.useMicroService = (endpoint, token) => new MicroService(endpoint, token);
exports.describeMicroService = (describer) => (app, path, token) => describer({
    registerFunc: (funcName, cb) => {
        app.post(`${path}/${funcName}`, async (req, res) => {
            if (req.headers.token !== token) {
                throw new http_errors_1.Unauthorized('Invalid token');
            }
            const result = await cb(req.body.data);
            res.send(result);
        });
    }
});
