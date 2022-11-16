"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryMethodAsync = void 0;
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function factoryMethodAsync(factoryMethod) {
    return (0, decorators_1.addDefinitionProperty)("injectFactoryMethodAsync", [util_1.Util.getClassNameOrId(factoryMethod)], true);
}
exports.factoryMethodAsync = factoryMethodAsync;
//# sourceMappingURL=factoryMethodAsync.js.map