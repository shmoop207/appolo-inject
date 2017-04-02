"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class Define {
    constructor(injector, id, type) {
        if (!id) {
            return;
        }
        this.id = id;
        this.injector = injector;
        this.definition = {
            type: type,
            inject: [],
            alias: [],
            aliasFactory: [],
            args: []
        };
        injector.addDefinition(id, this.definition);
    }
    type(type) {
        this.definition.type = type;
        return this;
    }
    singleton(singleton = true) {
        this.definition.singleton = _.isUndefined(singleton) ? true : singleton;
        return this;
    }
    inject(name, inject) {
        if (_.isString(name) && _.includes(name, " ")) {
            name = name.split(" ");
        }
        if (_.isArray(name)) {
            this.definition.inject.push.apply(this.definition.inject, name);
        }
        else if (_.isObject(name)) {
            this.definition.inject.push(name);
        }
        else if (_.toArray(arguments).length == 1 && _.isString(name)) {
            this.definition.inject.push({ name: name, ref: name });
        }
        else if (_.toArray(arguments).length == 2 && _.isString(name)) {
            this.definition.inject.push({ name: name, ref: inject || name });
        }
        return this;
    }
    injectFactoryMethod(name, factoryMethod) {
        return this.inject({
            name: name,
            factoryMethod: factoryMethod
        });
    }
    injectAlias(name, alias, indexBy) {
        return this.inject({
            name: name,
            alias: alias,
            indexBy: indexBy
        });
    }
    injectAliasFactory(name, alias, indexBy) {
        return this.inject({
            name: name,
            aliasFactory: alias,
            indexBy: indexBy
        });
    }
    injectArray(name, arr) {
        return this.inject({
            name: name,
            array: arr
        });
    }
    injectDictionary(name, dic) {
        return this.inject({
            name: name,
            dictionary: dic
        });
    }
    injectFactory(name, factory) {
        return this.inject({
            name: name,
            factory: factory
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
        if (_.isArray(alias)) {
            this.definition.alias.push.apply(this.definition.alias, alias);
        }
        else {
            this.definition.alias.push(alias);
        }
        return this;
    }
    initMethod(initMethod) {
        this.definition.initMethod = initMethod || "initialize";
        return this;
    }
    injectorAware() {
        this.definition.injectorAware = true;
        return this;
    }
    aliasFactory(aliasFactory) {
        if (_.isArray(aliasFactory)) {
            this.definition.aliasFactory.push.apply(this.definition.aliasFactory, aliasFactory);
        }
        else {
            this.definition.aliasFactory.push(aliasFactory);
        }
        return this;
    }
    args(args) {
        if (_.isArray(args)) {
            this.definition.args.push.apply(this.definition.args, args);
        }
        else {
            this.definition.args.push(args);
        }
        return this;
    }
    define(id, type) {
        return this.injector.define(id, type);
    }
}
exports.Define = Define;
//# sourceMappingURL=define.js.map