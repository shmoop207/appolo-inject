import {IDefinition, IParamInject} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {Injector, IsWiredSymbol} from "../../inject/inject";
import {_getByParamObj} from "./_getByParamObj";
import {_defineProperty} from "./_defineProperty";
import {_createFactoryMethod} from "../factories/_createFactoryMethod";
import {_createFactoryMethodAsync} from "../factories/_createFactoryMethodAsync";

export function _injectPropertiesAndLookUpMethods<T>(this: Injector, object: T, objectDefinition: IDefinition, objectId: string) {
    if (object[IsWiredSymbol]) {
        return;
    }
    let obj, properties = objectDefinition.inject;

    for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
        let prop = properties[i];
        if (prop.array) {

            object[prop.name] = (prop.array || []).map<IParamInject>((propObj: IParamInject) => propObj.value || _getByParamObj.call(this, propObj, propObj.ref));
        } else if (prop.dictionary) {
            let injectObject = {};

            (prop.dictionary || []).forEach((propObj: IParamInject) => injectObject[propObj.key] = propObj.value || _getByParamObj.call(this, propObj, propObj.ref));

            object[prop.name] = injectObject;

        } else if (prop.value) {

            object[prop.name] = prop.value;

        } else if (prop.ref) { //check if we have ref and we don't have factory with the same name


            if (prop.lazy) {
                _defineProperty.call(this,object, prop.name, Util.createDelegate(_getByParamObj, this, [ prop, prop.ref]), true,false)
            } else {
                object[prop.name] = _getByParamObj.call(this, prop, prop.ref);
            }

        } else if (prop.objectProperty) {
            obj = _getByParamObj.call(this,prop, prop.objectProperty.object);

            object[prop.name] = obj[prop.objectProperty.property];

        } else if (prop.factory) {

            if (!this._factoriesObjects[objectId]) {
                this._factoriesObjects[objectId] = {};
            }

            this._factoriesObjects[objectId][prop.name] = prop.factory;

        } else if (prop.factoryMethod) {

            object[prop.name] = Util.createDelegate(_createFactoryMethod, this, [prop.factoryMethod, prop.injector || this])
        } else if (prop.factoryMethodAsync) {

            object[prop.name] = Util.createDelegate(_createFactoryMethodAsync, this, [prop.factoryMethodAsync, prop.injector || this])
        } else if (prop.lazyFn) {
            _defineProperty.call(this,object, prop.name, prop.lazyFn,false,true)

        }

    }


}
