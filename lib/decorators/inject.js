"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function inject(inject) {
    return function (target, propertyKey, descriptor) {
        if (!propertyKey || typeof descriptor == "number") {
            injectParam(inject).apply(this, arguments);
        }
        else {
            decorators_1.addDefinitionProperty("inject", [util_1.Util.getClassNameOrId(inject)], true).apply(this, arguments);
        }
    };
}
exports.inject = inject;
function injectParam(name) {
    return function (target, propertyKey, index) {
        let args = [];
        // //we have a constructor
        if (!propertyKey) {
            args = util_1.Util.getFunctionArgs(target);
            decorators_1.addDefinition("args", [{ ref: util_1.Util.getClassNameOrId(name) || args[index] }, index], target);
            return;
        }
        args = util_1.Util.getFunctionArgs(target.constructor.prototype[propertyKey]);
        let injectDef = Reflect.getOwnMetadata(decorators_1.InjectParamSymbol, target) || util_1.Util.cloneDeep(Reflect.getMetadata(decorators_1.InjectParamSymbol, target));
        if (!injectDef) {
            injectDef = [];
            Reflect.defineMetadata(decorators_1.InjectParamSymbol, injectDef, target.constructor);
        }
        injectDef.push({
            param: name || args[index],
            method: propertyKey,
            index: index
        });
    };
}
//# sourceMappingURL=inject.js.map