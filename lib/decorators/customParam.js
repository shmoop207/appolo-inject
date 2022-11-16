"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customParam = void 0;
const decorators_1 = require("./decorators");
function customParam(key, value) {
    return (0, decorators_1.addDefinitionClass)("customParam", [key, value]);
}
exports.customParam = customParam;
//# sourceMappingURL=customParam.js.map