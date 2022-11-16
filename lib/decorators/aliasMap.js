"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasMap = void 0;
const decorators_1 = require("./decorators");
function aliasMap(alias, indexBy) {
    return (0, decorators_1.addDefinitionProperty)("injectAlias", [alias, { type: "map", index: indexBy }], true);
}
exports.aliasMap = aliasMap;
//# sourceMappingURL=aliasMap.js.map