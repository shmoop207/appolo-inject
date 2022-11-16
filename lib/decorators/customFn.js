"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFn = void 0;
const decorators_1 = require("./decorators");
function customFn(fn) {
    return (0, decorators_1.addDefinitionProperty)("injectLazyFn", [fn], true);
}
exports.customFn = customFn;
//# sourceMappingURL=customFn.js.map