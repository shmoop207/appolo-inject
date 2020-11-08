"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alias = void 0;
const decorators_1 = require("./decorators");
function alias(alias, indexBy) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectAlias(alias, indexBy).apply(this, arguments);
        }
        else {
            decorators_1.addDefinitionClass("alias", [alias]).apply(this, arguments);
        }
    };
}
exports.alias = alias;
function injectAlias(alias, indexBy) {
    return decorators_1.addDefinitionProperty("injectAlias", [alias, indexBy], true);
}
//# sourceMappingURL=alias.js.map