"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasFactory = void 0;
const decorators_1 = require("./decorators");
function aliasFactory(aliasFactory, indexBy) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectAliasFactory(aliasFactory, indexBy).apply(this, arguments);
        }
        else {
            decorators_1.addDefinitionClass("aliasFactory", [aliasFactory]).apply(this, arguments);
        }
    };
}
exports.aliasFactory = aliasFactory;
function injectAliasFactory(alias, indexBy) {
    return decorators_1.addDefinitionProperty("injectAliasFactory", [alias, indexBy], true);
}
//# sourceMappingURL=aliasFactory.js.map