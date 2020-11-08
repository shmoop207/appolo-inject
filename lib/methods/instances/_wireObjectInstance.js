"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._wireObjectInstance = void 0;
const _injectPropertiesAndLookUpMethods_1 = require("../properties/_injectPropertiesAndLookUpMethods");
const _injectAliasFactory_1 = require("../alias/_injectAliasFactory");
const inject_1 = require("../../inject/inject");
const _injectFactoryObject_1 = require("../factories/_injectFactoryObject");
const _invokeBootStrapMethod_1 = require("../methods/_invokeBootStrapMethod");
const _invokeInitMethod_1 = require("../methods/_invokeInitMethod");
const _injectAlias_1 = require("../alias/_injectAlias");
function _wireObjectInstance(instance, definition, objectId) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    //inject properties  and look up methods
    _injectPropertiesAndLookUpMethods_1._injectPropertiesAndLookUpMethods.call(this, instance, definition, objectId);
    _injectFactoryObject_1._injectFactoryObject.call(this, instance, objectId);
    _injectAlias_1._injectAlias.call(this, definition, instance);
    _injectAliasFactory_1._injectAliasFactory.call(this, definition, instance);
    _invokeInitMethod_1._invokeInitMethod.call(this, instance, definition);
    _invokeBootStrapMethod_1._invokeBootStrapMethod.call(this, instance, definition);
    instance[inject_1.IsWiredSymbol] = true;
}
exports._wireObjectInstance = _wireObjectInstance;
//# sourceMappingURL=_wireObjectInstance.js.map