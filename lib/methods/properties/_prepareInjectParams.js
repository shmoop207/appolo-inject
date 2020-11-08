"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._prepareInjectParams = void 0;
const decorators_1 = require("../../decorators/decorators");
const util_1 = require("../../utils/util");
function _prepareInjectParams(def) {
    let $self = this;
    if (!def.type) {
        return;
    }
    let params = Reflect.getMetadata(decorators_1.InjectParamSymbol, def.type);
    if (!params || !util_1.Util.isFunction(def.type)) {
        return;
    }
    let paramGroups = util_1.Util.groupByArray(params, "method");
    Object.keys(paramGroups).forEach(method => {
        let items = paramGroups[method];
        let oldFn = def.type.prototype[method];
        oldFn = oldFn.originFn || oldFn;
        def.type.prototype[method] = function (...args) {
            for (let i = 0, length = (items.length || 0); i < length; i++) {
                args[items[i].index] = $self.getObject(items[i].param);
            }
            return oldFn.apply(this, args);
        };
        def.type.prototype[method].originFn = oldFn;
    });
}
exports._prepareInjectParams = _prepareInjectParams;
//# sourceMappingURL=_prepareInjectParams.js.map