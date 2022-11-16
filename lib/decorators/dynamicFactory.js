"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicFactory = void 0;
const decorators_1 = require("./decorators");
function dynamicFactory(factory) {
    return (0, decorators_1.addDefinitionClass)("dynamicFactory", [factory]);
}
exports.dynamicFactory = dynamicFactory;
//# sourceMappingURL=dynamicFactory.js.map