"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initAlias = void 0;
const _injectFactoryObject_1 = require("../factories/_injectFactoryObject");
const _injectAlias_1 = require("./_injectAlias");
const _injectAliasFactory_1 = require("./_injectAliasFactory");
function _initAlias() {
    if (this._isInitialized) {
        return;
    }
    let keys = Object.keys(this._instances);
    this.children.forEach(injector => injector.initAlias());
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];
        let def = this._definitions[objectId];
        if (def) {
            _injectFactoryObject_1._injectFactoryObject.call(this, instance, objectId);
            _injectAlias_1._injectAlias.call(this, def, instance);
            _injectAliasFactory_1._injectAliasFactory.call(this, def, instance);
        }
    }
}
exports._initAlias = _initAlias;
//# sourceMappingURL=_initAlias.js.map