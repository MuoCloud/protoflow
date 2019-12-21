"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class MongoDB {
    static get client() {
        if (!this.mongoClient) {
            throw new Error('MongoDB Connection has not been established');
        }
        return this.mongoClient;
    }
    static async connect(uri) {
        this.mongoClient = await mongodb_1.MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        if (this.onConnectedCallback) {
            this.onConnectedCallback();
        }
    }
    static onConnected(callback) {
        this.onConnectedCallback = callback;
        if (this.mongoClient) {
            callback();
        }
    }
}
exports.useMongoDB = async (uri) => MongoDB.connect(uri);
exports.default = MongoDB;
