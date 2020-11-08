"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._createFactoryMethod = void 0;
function _createFactoryMethod(objectId, injector, runtimeArgs) {
    let instance = injector._get(objectId, runtimeArgs);
    let def = injector.getDefinition(objectId);
    return def.dynamicFactory ? instance.get() : instance;
}
exports._createFactoryMethod = _createFactoryMethod;
//# sourceMappingURL=_createFactoryMethod.js.map