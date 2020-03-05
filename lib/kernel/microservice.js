"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const http_errors_1 = require("http-errors");
class MicroService {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    static registerFunc(funcName, cb) {
        this.state.app.post(`${this.state.path}/${funcName}`, async (req, res) => {
            const result = await cb(req.body);
            res.send(result);
        });
    }
    async call(funcName, data) {
        try {
            const result = await axios_1.default
                .post(`${this.endpoint}/${funcName}`, { data });
            return result.data;
        }
        catch (error) {
            throw new http_errors_1.ServiceUnavailable(`Call function ${funcName} failed`);
        }
    }
}
exports.MicroService = MicroService;
exports.useMicroService = (endpoint) => new MicroService(endpoint);
exports.createMicroServiceFunc = (funcName, cb) => MicroService.registerFunc(funcName, cb);
