"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasFactoryMap = void 0;
const decorators_1 = require("./decorators");
function aliasFactoryMap(alias, indexBy) {
    return (0, decorators_1.addDefinitionProperty)("injectAliasFactory", [alias, { type: "map", index: indexBy }], true);
}
exports.aliasFactoryMap = aliasFactoryMap;
//# sourceMappingURL=aliasFactoryMap.js.map