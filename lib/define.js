"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Define {
    constructor(id, type) {
        if (!id) {
            return;
        }
        this._id = id;
        this._definition = {
            id: this._id,
            type: type,
            inject: [],
            alias: [],
            aliasFactory: [],
            args: [],
            path: "",
            customParams: {},
            override: false
        };
    }
    customParam(key, value) {
        if (!this._definition.customParams[key]) {
            this._definition.customParams[key] = [];
        }
        this._definition.customParams[key].push(value);
        return this;
    }
    get definition() {
        return this._definition;
    }
    type(type) {
        this._definition.type = type;
        return this;
    }
    singleton(singleton = true) {
        this._definition.singleton = util_1.Util.isUndefined(singleton) ? true : singleton;
        return this;
    }
    factory(factory = true) {
        this._definition.factory = util_1.Util.isUndefined(factory) ? true : factory;
        //factory must be singleton
        if (this._definition.factory) {
            this._definition.singleton = true;
        }
        return this;
    }
    dynamicFactory(factory = true) {
        this._definition.dynamicFactory = util_1.Util.isUndefined(factory) ? true : factory;
        return this;
    }
    path(path) {
        this._definition.path = path;
        return this;
    }
    injectLazyFn(name, fn) {
        this.inject({ name, lazyFn: fn });
    }
    lazy(lazy = true) {
        this._definition.lazy = util_1.Util.isUndefined(lazy) ? true : lazy;
        return this;
    }
    override(override = true) {
        this._definition.override = util_1.Util.isUndefined(override) ? true : override;
        return this;
    }
    inject(name, inject, parent) {
        if (util_1.Util.isString(name) && name.includes(" ")) {
            name = name.split(" ");
        }
        if (Array.isArray(name)) {
            this._definition.inject.push.apply(this._definition.inject, name);
        }
        else if (util_1.Util.isObject(name)) {
            this._definition.inject.push(name);
        }
        else {
            this._definition.inject.push({ name: name, ref: inject || name, parent: parent });
        }
        // else if (_.toArray(arguments).length == 1 && _.isString(name)) {
        //     this._definition.inject.push({name: name, ref: name})
        // } else if (_.toArray(arguments).length == 2 && _.isString(name)) {
        //     this._definition.inject.push({name: name, ref: inject || name})
        // } else {
        //
        // }
        return this;
    }
    injectLazy(name, inject, parent) {
        return this.inject({
            name: name,
            ref: inject || name,
            lazy: true,
            parent: parent
        });
    }
    injectFactoryMethod(name, factoryMethod, parent) {
        return this.inject({
            name: name,
            factoryMethod: factoryMethod,
            parent: parent
        });
    }
    injectAlias(name, alias, indexBy, parent) {
        return this.inject({
            name: name,
            alias: alias,
            indexBy: indexBy, parent
        });
    }
    injectAliasFactory(name, alias, indexBy, parent) {
        return this.inject({
            name: name,
            aliasFactory: alias,
            indexBy: indexBy, parent
        });
    }
    injectArray(name, arr, parent) {
        return this.inject({
            name: name,
            array: arr, parent
        });
    }
    injectDictionary(name, dic, parent) {
        return this.inject({
            name: name,
            dictionary: dic, parent
        });
    }
    injectFactory(name, factory, parent) {
        return this.inject({
            name: name,
            factory: { id: factory || name },
            parent
        });
    }
    injectObjectProperty(name, object, propertyName) {
        return this.inject({
            name: name,
            objectProperty: {
                object: object,
                property: propertyName
            }
        });
    }
    injectValue(name, value) {
        return this.inject({
            name: name,
            value: value
        });
    }
    alias(alias) {
        if (Array.isArray(alias)) {
            this._definition.alias.push.apply(this._definition.alias, alias);
        }
        else {
            this._definition.alias.push(alias);
        }
        return this;
    }
    initMethod(initMethod) {
        this._definition.initMethod = initMethod || "initialize";
        return this;
    }
    initMethodAsync(initMethod) {
        this._definition.initMethodAsync = initMethod || "initialize";
        return this;
    }
    injectorAware() {
        this._definition.injectorAware = true;
        return this;
    }
    aliasFactory(aliasFactory) {
        if (Array.isArray(aliasFactory)) {
            this._definition.aliasFactory.push.apply(this._definition.aliasFactory, aliasFactory);
        }
        else {
            this._definition.aliasFactory.push(aliasFactory);
        }
        return this;
    }
    args(args, index) {
        if (Array.isArray(args)) {
            this._definition.args.push.apply(this._definition.args, args);
        }
        else if (index !== undefined) {
            this._definition.args[index] = args;
        }
        else {
            this._definition.args.push(args);
        }
        return this;
    }
}
exports.Define = Define;
//# sourceMappingURL=define.js.map