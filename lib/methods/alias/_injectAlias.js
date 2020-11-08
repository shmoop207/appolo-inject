"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._injectAlias = void 0;
const util_1 = require("../../utils/util");
const inject_1 = require("../../inject/inject");
function _injectAlias(definition, instance) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let prop = definition.inject[i];
        let injector = prop.injector ? prop.injector : this;
        if (!prop.alias) {
            continue;
        }
        let alias = injector.getAlias(prop.alias);
        instance[prop.name] = (!prop.indexBy)
            ? alias
            : ((typeof prop.indexBy == "string")
                ? util_1.Util.keyBy(alias, prop.indexBy)
                : util_1.Util.keyByMap(alias, prop.indexBy.index));
    }
}
exports._injectAlias = _injectAlias;
//# sourceMappingURL=_injectAlias.js.map