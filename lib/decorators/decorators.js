"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefinitionProperty = exports.addDefinitionClass = exports.addDefinition = exports.EmptyFunction = exports.InjectParamSymbol = exports.InjectDefineSymbol = exports.InjectDefinitionsSymbol = void 0;
require("reflect-metadata");
const util_1 = require("../utils/util");
exports.InjectDefinitionsSymbol = "__injectDefinitions__";
exports.InjectDefineSymbol = "__injectDefine__";
exports.InjectParamSymbol = "__injectParam__";
exports.EmptyFunction = () => {
};
function addDefinition(name, args, type) {
    let injectDef = util_1.Util.getReflectData(exports.InjectDefinitionsSymbol, type, []);
    injectDef.push({ name: name, args: args });
}
exports.addDefinition = addDefinition;
function addDefinitionClass(name, args) {
    return function (name, args, fn) {
        addDefinition(name, args, fn);
    }.bind(null, name, args);
}
exports.addDefinitionClass = addDefinitionClass;
function addDefinitionProperty(name, args, pushClass = false) {
    return function (name, args, target, propertyKey, descriptor) {
        args.unshift(propertyKey);
        if (pushClass) {
            args.push(target.constructor);
        }
        addDefinition(name, args, target.constructor);
    }.bind(null, name, args);
}
exports.addDefinitionProperty = addDefinitionProperty;
//# sourceMappingURL=decorators.js.map