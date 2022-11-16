"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const singleton_1 = require("./singleton");
const decorators_1 = require("./decorators");
const util_1 = require("../utils/util");
function factory(factory) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectFactory(factory).apply(this, arguments);
        }
        else {
            (0, decorators_1.addDefinitionClass)("factory", []).apply(this, arguments);
            (0, singleton_1.singleton)().apply(this, arguments);
        }
    };
}
exports.factory = factory;
function injectFactory(factory) {
    return (0, decorators_1.addDefinitionProperty)("injectFactory", [util_1.Util.getClassNameOrId(factory)], true);
}
//# sourceMappingURL=factory.js.map