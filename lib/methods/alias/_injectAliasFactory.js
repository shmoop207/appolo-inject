"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._injectAliasFactory = void 0;
const util_1 = require("../../utils/util");
const inject_1 = require("../../inject/inject");
function _injectAliasFactory(definition, instance) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let prop = definition.inject[i];
        let injector = prop.injector ? prop.injector : this;
        if (!prop.aliasFactory) {
            continue;
        }
        let alias = injector.getAliasFactory(prop.aliasFactory);
        if (!prop.indexBy) {
            instance[prop.name] = alias;
        }
        else {
            let fn = function (key, type = "object") {
                let fn = (item) => util_1.Util.isFunction(key) ? key(item.type, i) : item.type[key];
                return type == "map" ? util_1.Util.keyByMap(alias, fn) : util_1.Util.keyBy(alias, fn);
            };
            instance[prop.name] = typeof prop.indexBy == "string"
                ? fn(prop.indexBy, "object")
                : fn(prop.indexBy.index, "map");
        }
    }
}
exports._injectAliasFactory = _injectAliasFactory;
//# sourceMappingURL=_injectAliasFactory.js.map