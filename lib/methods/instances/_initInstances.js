"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initInstances = void 0;
const _createObjectInstance_1 = require("./_createObjectInstance");
const util_1 = require("../../utils/util");
async function _initInstances() {
    if (this._isInitialized) {
        return;
    }
    await this._events.beforeInitInstances.fireEventAsync();
    await util_1.Util.runRegroupByParallel(this.children, inject => inject.options.parallel, injector => injector.initInstances());
    let keys = Object.keys(this._definitions);
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], definition = this._definitions[objectId];
        (definition.singleton && !definition.lazy) && (_createObjectInstance_1._createObjectInstance.call(this, objectId, definition));
    }
}
exports._initInstances = _initInstances;
//# sourceMappingURL=_initInstances.js.map