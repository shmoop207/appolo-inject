"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getFactoryValue = void 0;
function _getFactoryValue(objectID, definitions) {
    let def = definitions || this._definitions[objectID];
    if (!def) {
        return this.parent ? this.parent.getFactoryValue(objectID) : null;
    }
    if (def.injector && def.injector !== this) {
        return def.injector.getFactoryValue(def.refName || def.id);
    }
    return this._factoriesValues[def.id];
}
exports._getFactoryValue = _getFactoryValue;
//# sourceMappingURL=getFactoryValue.js.map