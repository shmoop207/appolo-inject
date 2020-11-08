"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._addSingletonAliases = void 0;
const util_1 = require("../../utils/util");
function _addSingletonAliases(def, instance, checkFactory = true) {
    if (def.alias && def.alias.length && (!checkFactory || !def.factory)) {
        let keys = Object.keys(def.alias);
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            util_1.Util.mapPush(this._alias, def.alias[key], instance);
        }
    }
}
exports._addSingletonAliases = _addSingletonAliases;
//# sourceMappingURL=_addSingletonAliases.js.map