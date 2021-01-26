"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._injectPropertiesAndLookUpMethods = void 0;
const util_1 = require("../../utils/util");
const inject_1 = require("../../inject/inject");
const _getByParamObj_1 = require("./_getByParamObj");
const _defineProperty_1 = require("./_defineProperty");
const _createFactoryMethod_1 = require("../factories/_createFactoryMethod");
const _createFactoryMethodAsync_1 = require("../factories/_createFactoryMethodAsync");
function _injectPropertiesAndLookUpMethods(object, objectDefinition, objectId) {
    if (object[inject_1.IsWiredSymbol]) {
        return;
    }
    let obj, properties = objectDefinition.inject;
    for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
        let prop = properties[i];
        if (prop.array) {
            object[prop.name] = (prop.array || []).map((propObj) => propObj.value || _getByParamObj_1._getByParamObj.call(this, propObj, propObj.ref));
        }
        else if (prop.dictionary) {
            let injectObject = {};
            (prop.dictionary || []).forEach((propObj) => injectObject[propObj.key] = propObj.value || _getByParamObj_1._getByParamObj.call(this, propObj, propObj.ref));
            object[prop.name] = injectObject;
        }
        else if (prop.value) {
            object[prop.name] = prop.value;
        }
        else if (prop.ref) { //check if we have ref and we don't have factory with the same name
            if (prop.lazy) {
                _defineProperty_1._defineProperty.call(this, object, prop.name, util_1.Util.createDelegate(_getByParamObj_1._getByParamObj, this, [prop, prop.ref]), true, false);
            }
            else {
                object[prop.name] = _getByParamObj_1._getByParamObj.call(this, prop, prop.ref);
            }
        }
        else if (prop.objectProperty) {
            obj = _getByParamObj_1._getByParamObj.call(this, prop, prop.objectProperty.object);
            object[prop.name] = obj[prop.objectProperty.property];
        }
        else if (prop.factory) {
            if (!this._factoriesObjects[objectId]) {
                this._factoriesObjects[objectId] = {};
            }
            this._factoriesObjects[objectId][prop.name] = prop.factory;
        }
        else if (prop.factoryMethod) {
            object[prop.name] = util_1.Util.createDelegate(_createFactoryMethod_1._createFactoryMethod, this, [prop.factoryMethod, prop.injector || this]);
        }
        else if (prop.factoryMethodAsync) {
            object[prop.name] = util_1.Util.createDelegate(_createFactoryMethodAsync_1._createFactoryMethodAsync, this, [prop.factoryMethodAsync, prop.injector || this]);
        }
        else if (prop.lazyFn) {
            _defineProperty_1._defineProperty.call(this, object, prop.name, prop.lazyFn, false, true);
        }
    }
}
exports._injectPropertiesAndLookUpMethods = _injectPropertiesAndLookUpMethods;
//# sourceMappingURL=_injectPropertiesAndLookUpMethods.js.map