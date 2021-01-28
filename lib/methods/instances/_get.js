"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getFromDefinition = exports._get = void 0;
const _createObjectInstance_1 = require("./_createObjectInstance");
function _get(objectID, runtimeArgs) {
    let instance = this._instances[objectID];
    if (instance) {
        return instance;
    }
    let def = this._definitions[objectID];
    if (def) {
        return _getFromDefinition.call(this, def, objectID, runtimeArgs);
    }
    if (this.parent) {
        return this.parent.getObject(objectID, runtimeArgs);
    }
    throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
}
exports._get = _get;
function _getFromDefinition(def, objectID, runtimeArgs) {
    return def.injector && def.injector !== this
        ? def.injector.getObject(def.refName || objectID, runtimeArgs)
        : _createObjectInstance_1._createObjectInstance.call(this, objectID, def, runtimeArgs);
}
exports._getFromDefinition = _getFromDefinition;
//# sourceMappingURL=_get.js.map