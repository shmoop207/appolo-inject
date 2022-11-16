"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazy = void 0;
const decorators_1 = require("./decorators");
const util_1 = require("../utils/util");
function lazy(inject) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectLazy(inject).apply(this, arguments);
        }
        else {
            (0, decorators_1.addDefinitionClass)("lazy", []).apply(this, arguments);
        }
    };
}
exports.lazy = lazy;
function injectLazy(inject) {
    return (0, decorators_1.addDefinitionProperty)("injectLazy", [util_1.Util.getClassNameOrId(inject)], true);
}
//# sourceMappingURL=lazy.js.map