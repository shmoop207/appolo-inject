"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.value = exports.objectProperty = exports.dictionary = exports.array = exports.factoryMethodAsync = exports.factoryMethod = exports.customFn = exports.inject = exports.bootstrapAsync = exports.bootstrap = exports.initAsync = exports.init = exports.aliasFactory = exports.alias = exports.customParam = exports.override = exports.lazy = exports.dynamicFactory = exports.factory = exports.injectorAware = exports.singleton = exports.define = exports.InjectParamSymbol = exports.InjectDefineSymbol = exports.InjectDefinitionsSymbol = void 0;
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
        (Reflect.getMetadata(exports.InjectDefinitionsSymbol, fn) || []).forEach((item) => define[item.name].apply(define, item.args));
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
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectFactory(factory).apply(this, arguments);
        }
        else {
            addDefinitionClass("factory", []).apply(this, arguments);
            singleton().apply(this, arguments);
        }
    };
}
exports.factory = factory;
function injectFactory(factory) {
    return addDefinitionProperty("injectFactory", [util_1.Util.getClassNameOrId(factory)], true);
}
function dynamicFactory(factory) {
    return addDefinitionClass("dynamicFactory", [factory]);
}
exports.dynamicFactory = dynamicFactory;
function lazy(inject) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectLazy(inject).apply(this, arguments);
        }
        else {
            addDefinitionClass("lazy", []).apply(this, arguments);
        }
    };
}
exports.lazy = lazy;
function injectLazy(inject) {
    return addDefinitionProperty("injectLazy", [util_1.Util.getClassNameOrId(inject)], true);
}
function override() {
    return addDefinitionClass("override", []);
}
exports.override = override;
function customParam(key, value) {
    return addDefinitionClass("customParam", [key, value]);
}
exports.customParam = customParam;
function alias(alias, indexBy) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectAlias(alias, indexBy).apply(this, arguments);
        }
        else {
            addDefinitionClass("alias", [alias]).apply(this, arguments);
        }
    };
}
exports.alias = alias;
function aliasFactory(aliasFactory, indexBy) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            injectAliasFactory(aliasFactory, indexBy).apply(this, arguments);
        }
        else {
            addDefinitionClass("aliasFactory", [aliasFactory]).apply(this, arguments);
        }
    };
}
exports.aliasFactory = aliasFactory;
function init() {
    return addDefinitionProperty("initMethod", []);
}
exports.init = init;
function initAsync() {
    return addDefinitionProperty("initMethodAsync", []);
}
exports.initAsync = initAsync;
function bootstrap() {
    return addDefinitionProperty("bootstrapMethod", []);
}
exports.bootstrap = bootstrap;
function bootstrapAsync() {
    return addDefinitionProperty("bootstrapMethodAsync", []);
}
exports.bootstrapAsync = bootstrapAsync;
function inject(inject) {
    return function (target, propertyKey, descriptor) {
        if (!propertyKey || typeof descriptor == "number") {
            injectParam(inject).apply(this, arguments);
        }
        else {
            addDefinitionProperty("inject", [util_1.Util.getClassNameOrId(inject)], true).apply(this, arguments);
        }
    };
}
exports.inject = inject;
function customFn(fn) {
    return addDefinitionProperty("injectLazyFn", [fn], true);
}
exports.customFn = customFn;
function factoryMethod(factoryMethod) {
    return addDefinitionProperty("injectFactoryMethod", [util_1.Util.getClassNameOrId(factoryMethod)], true);
}
exports.factoryMethod = factoryMethod;
function factoryMethodAsync(factoryMethod) {
    return addDefinitionProperty("injectFactoryMethodAsync", [util_1.Util.getClassNameOrId(factoryMethod)], true);
}
exports.factoryMethodAsync = factoryMethodAsync;
function injectAlias(alias, indexBy) {
    return addDefinitionProperty("injectAlias", [alias, indexBy], true);
}
function injectAliasFactory(alias, indexBy) {
    return addDefinitionProperty("injectAliasFactory", [alias, indexBy], true);
}
function array(arr) {
    return addDefinitionProperty("injectArray", [(arr || []).map(item => ({ ref: util_1.Util.getClassNameOrId(item) }))], true);
}
exports.array = array;
function dictionary(dic) {
    let args = Object.keys(dic).map(key => ({
        key: key,
        ref: util_1.Util.getClassNameOrId(dic[key])
    }));
    return addDefinitionProperty("injectDictionary", [args], true);
}
exports.dictionary = dictionary;
function objectProperty(object, propertyName) {
    return addDefinitionProperty("injectObjectProperty", [util_1.Util.getClassNameOrId(object), propertyName], true);
}
exports.objectProperty = objectProperty;
function value(value) {
    return addDefinitionProperty("injectValue", [value]);
}
exports.value = value;
function injectParam(name) {
    return function (target, propertyKey, index) {
        let args = [];
        // //we have a constructor
        if (!propertyKey) {
            args = util_1.Util.getFunctionArgs(target);
            addDefinition("args", [{ ref: util_1.Util.getClassNameOrId(name) || args[index] }, index], target);
            return;
        }
        args = util_1.Util.getFunctionArgs(target.constructor.prototype[propertyKey]);
        let injectDef = Reflect.getOwnMetadata(exports.InjectParamSymbol, target) || util_1.Util.cloneDeep(Reflect.getMetadata(exports.InjectParamSymbol, target));
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
//# sourceMappingURL=decorators.js.map