"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._loadFactory = void 0;
async function _loadFactory(objectId) {
    let factoryData = this._factoriesObjects[objectId];
    let keys = Object.keys(factoryData || {});
    for (let propName of keys) {
        let factory = factoryData[propName];
        await this.loadFactory(factory.id);
    }
    this._factoriesValues[objectId] = await this.getFactory(objectId);
}
exports._loadFactory = _loadFactory;
//# sourceMappingURL=_loadFactory.js.map