"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initInitMethods = void 0;
const _invokeInitMethod_1 = require("./_invokeInitMethod");
async function _initInitMethods() {
    if (this._isInitialized) {
        return;
    }
    await this._events.beforeInitMethods.fireEventAsync();
    let keys = Object.keys(this._instances);
    await Promise.all(this.children.map(injector => injector.initInitMethods()));
    let asyncInitPromises = [];
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];
        let def = this._definitions[objectId];
        if (def) {
            (_invokeInitMethod_1._invokeInitMethod.call(this, instance, this._definitions[objectId]));
            def.initMethodAsync && asyncInitPromises.push(instance[def.initMethodAsync]());
        }
    }
    if (asyncInitPromises.length) {
        await Promise.all(asyncInitPromises);
    }
}
exports._initInitMethods = _initInitMethods;
//# sourceMappingURL=_initInitMethods.js.map