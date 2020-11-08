"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._injectFactoryObject = void 0;
const inject_1 = require("../../inject/inject");
function _injectFactoryObject(instance, objectId) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    let factoryData = this._factoriesObjects[objectId];
    if (!factoryData) {
        return;
    }
    let keys = Object.keys(factoryData);
    for (let i = 0, len = keys.length; i < len; i++) {
        let propName = keys[i], factory = factoryData[propName];
        instance[propName] = factory.injector && factory.injector !== this ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
    }
}
exports._injectFactoryObject = _injectFactoryObject;
//# sourceMappingURL=_injectFactoryObject.js.map