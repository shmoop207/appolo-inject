"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initProperties = void 0;
const _injectPropertiesAndLookUpMethods_1 = require("./_injectPropertiesAndLookUpMethods");
const util_1 = require("../../utils/util");
async function _initProperties() {
    if (this._isInitialized) {
        return;
    }
    await this._events.beforeInitProperties.fireEventAsync();
    await util_1.Util.runRegroupByParallel(this.children, inject => inject.options.parallel, injector => injector.initProperties());
    let keys = Object.keys(this._instances);
    //loop over instances and inject properties and look up methods only if exist in def
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];
        if (this._definitions[objectId]) {
            _injectPropertiesAndLookUpMethods_1._injectPropertiesAndLookUpMethods.call(this, instance, this._definitions[objectId], objectId);
        }
    }
}
exports._initProperties = _initProperties;
//# sourceMappingURL=_initProperties.js.map