"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
require("reflect-metadata");
const define_1 = require("./define");
const util_1 = require("./util");
exports.InjectDefinitionsSymbol = "__injectDefinitions__";
exports.InjectDefineSymbol = "__injectDefine__";
exports.InjectParamSymbol = "__injectParam__";
const EmptyFunction = () => {
};
function addDefinition(name, args, type) {
    let injectDef = util_1.Util.getReflectData(exports.InjectDefinitionsSymbol, type, []);
    injectDef.push({ name: name, args: args });
}
function addDefinitionClass(name, args) {
    return function (name, args, fn) {
        addDefinition(name, args, fn);
    }.bind(null, name, args);
}
function addDefinitionProperty(name, args, pushClass = false) {
    return function (name, args, target, propertyKey, descriptor) {
        args.unshift(propertyKey);
        if (pushClass) {
            args.push(target.constructor);
        }
        addDefinition(name, args, target.constructor);
    }.bind(null, name, args);
}
function define(id) {
    return function (id, fn) {
        let define = new define_1.Define(id || util_1.Util.getClassName(fn), fn);
        _.forEach(Reflect.getMetadata(exports.InjectDefinitionsSymbol, fn), (item) => define[item.name].apply(define, item.args));
        Reflect.defineMetadata(exports.InjectDefineSymbol, define, fn);
    }.bind(null, id);
}
exports.define = define;
function singleton(singleton) {
    if (singleton === false) {
        return EmptyFunction;
    }
    return addDefinitionClass("singleton", []);
}
exports.singleton = singleton;
function injectorAware() {
    return addDefinitionClass("injectorAware", []);
}
exports.injectorAware = injectorAware;
function factory(factory) {
    if (factory === false) {
        return EmptyFunction;
    }
    return addDefinitionClass("factory", []);
}
exports.factory = factory;
function lazy(lazy) {
    if (lazy === false) {
        return EmptyFunction;
    }
    return addDefinitionClass("lazy", []);
}
exports.lazy = lazy;
function override() {
    return addDefinitionClass("override", []);
}
exports.override = override;
function alias(alias) {
    return addDefinitionClass("alias", [alias]);
}
exports.alias = alias;
function aliasFactory(aliasFactory) {
    return addDefinitionClass("aliasFactory", [aliasFactory]);
}
exports.aliasFactory = aliasFactory;
function initMethod() {
    return addDefinitionProperty("initMethod", []);
}
exports.initMethod = initMethod;
function inject(inject) {
    return addDefinitionProperty("inject", [util_1.Util.getClassNameOrId(inject)], true);
}
exports.inject = inject;
function injectLazy(inject) {
    return addDefinitionProperty("injectLazy", [util_1.Util.getClassNameOrId(inject)], true);
}
exports.injectLazy = injectLazy;
function customInjectFn(fn) {
    return addDefinitionProperty("injectLazyFn", [fn], true);
}
exports.customInjectFn = customInjectFn;
function injectFactoryMethod(factoryMethod) {
    return addDefinitionProperty("injectFactoryMethod", [util_1.Util.getClassNameOrId(factoryMethod)], true);
}
exports.injectFactoryMethod = injectFactoryMethod;
function injectAlias(alias, indexBy) {
    return addDefinitionProperty("injectAlias", [alias, indexBy], true);
}
exports.injectAlias = injectAlias;
function injectAliasFactory(alias, indexBy) {
    return addDefinitionProperty("injectAliasFactory", [alias, indexBy], true);
}
exports.injectAliasFactory = injectAliasFactory;
function injectArray(arr) {
    return addDefinitionProperty("injectArray", [_.map(arr, item => ({ ref: util_1.Util.getClassNameOrId(item) }))], true);
}
exports.injectArray = injectArray;
function injectDictionary(dic) {
    let args = _.map(dic, (item, key) => ({
        key: key,
        ref: util_1.Util.getClassNameOrId(item)
    }));
    return addDefinitionProperty("injectDictionary", [args], true);
}
exports.injectDictionary = injectDictionary;
function injectFactory(factory) {
    return addDefinitionProperty("injectFactory", [util_1.Util.getClassNameOrId(factory)], true);
}
exports.injectFactory = injectFactory;
function injectObjectProperty(object, propertyName) {
    return addDefinitionProperty("injectObjectProperty", [util_1.Util.getClassNameOrId(object), propertyName], true);
}
exports.injectObjectProperty = injectObjectProperty;
function injectValue(value) {
    return addDefinitionProperty("injectValue", [value]);
}
exports.injectValue = injectValue;
function injectParam(name) {
    return function (target, propertyKey, index) {
        let args = [];
        // //we have a constructor
        if (!propertyKey) {
            args = util_1.Util.getFunctionArgs(target);
            addDefinition("args", [{ ref: util_1.Util.getClassNameOrId(name) || args[index] }], target);
            return;
        }
        args = util_1.Util.getFunctionArgs(target.constructor.prototype[propertyKey]);
        let injectDef = Reflect.getOwnMetadata(exports.InjectParamSymbol, target) || _.cloneDeep(Reflect.getMetadata(exports.InjectParamSymbol, target));
        if (!injectDef) {
            injectDef = [];
            Reflect.defineMetadata(exports.InjectParamSymbol, injectDef, target.constructor);
        }
        injectDef.push({
            param: name || args[index],
            method: propertyKey,
            index: index
        });
    };
}
exports.injectParam = injectParam;
//# sourceMappingURL=decorators.js.map