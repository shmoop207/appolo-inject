"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initBootstrapMethods = void 0;
const _invokeBootStrapMethod_1 = require("./_invokeBootStrapMethod");
async function _initBootstrapMethods() {
    if (this._isInitialized) {
        return;
    }
    let keys = Object.keys(this._instances);
    await this._events.beforeBootstrapMethods.fireEventAsync();
    await Promise.all(this.children.map(injector => injector.initBootstrapMethods()));
    let asyncBootstrapPromises = [];
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];
        let def = this._definitions[objectId];
        if (def) {
            (_invokeBootStrapMethod_1._invokeBootStrapMethod.call(this, instance, this._definitions[objectId]));
            def.bootstrapMethodAsync && asyncBootstrapPromises.push(instance[def.bootstrapMethodAsync]());
        }
    }
    if (asyncBootstrapPromises.length) {
        await Promise.all(asyncBootstrapPromises);
    }
    this._isInitialized = true;
    await this._events.afterInitialize.fireEventAsync();
}
exports._initBootstrapMethods = _initBootstrapMethods;
//# sourceMappingURL=_initBootstrapMethods.js.map