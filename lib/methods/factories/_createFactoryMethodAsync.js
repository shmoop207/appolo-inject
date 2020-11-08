"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._createFactoryMethodAsync = void 0;
async function _createFactoryMethodAsync(objectId, injector, runtimeArgs) {
    let instance = await injector.getAsync(objectId, runtimeArgs);
    let def = injector.getDefinition(objectId);
    return def.dynamicFactory ? instance.get() : instance;
}
exports._createFactoryMethodAsync = _createFactoryMethodAsync;
//# sourceMappingURL=_createFactoryMethodAsync.js.map