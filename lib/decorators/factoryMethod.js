"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryMethod = void 0;
const decorators_1 = require("./decorators");
const util_1 = require("../utils/util");
function factoryMethod(factoryMethod) {
    return (0, decorators_1.addDefinitionProperty)("injectFactoryMethod", [util_1.Util.getClassNameOrId(factoryMethod)], true);
}
exports.factoryMethod = factoryMethod;
//# sourceMappingURL=factoryMethod.js.map