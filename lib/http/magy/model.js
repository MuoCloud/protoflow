"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModelQueryManager {
    static storeConfig(model, config) {
        this.modelQueryConfigs[model.id] = config;
    }
    static getConfig(model) {
        return this.modelQueryConfigs[model.id];
    }
}
exports.ModelQueryManager = ModelQueryManager;
ModelQueryManager.modelQueryConfigs = {};
exports.useQuery = (model, config) => {
    ModelQueryManager.storeConfig(model, config);
    return model;
};
