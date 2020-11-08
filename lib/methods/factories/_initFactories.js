"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initFactories = void 0;
const util_1 = require("../../utils/util");
async function _initFactories() {
    if (this._isInitialized) {
        return;
    }
    await this._events.beforeInitFactories.fireEventAsync();
    await util_1.Util.runRegroupByParallel(this.children, inject => inject.options.parallel, injector => injector.initFactories());
    for (let factory of this._factories) {
        await this.loadFactory(factory);
    }
}
exports._initFactories = _initFactories;
//# sourceMappingURL=_initFactories.js.map