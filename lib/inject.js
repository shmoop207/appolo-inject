"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const define_1 = require("./define");
const decorators_1 = require("./decorators");
const util_1 = require("./util");
const IsWiredSymbol = Symbol("isWired");
class Injector {
    constructor() {
        this._isInitialized = false;
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factoriesObjects = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesValues = {};
        this._factories = [];
        this._children = [];
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
        value.children.push(this);
    }
    get options() {
        return this._options;
    }
    get children() {
        return this._children;
    }
    async initialize(options) {
        if (this._isInitialized) {
            return;
        }
        this._options = options || {};
        _.forEach(this._options.definitions, (def, id) => this.addDefinition(id, def));
        //we have parent so we wait until parent.initialize
        if (this.parent && !this._options.immediate) {
            return;
        }
        this.initDefinitions();
        this.initInstances();
        await this.initFactories();
        this.initProperties();
        this.initAlias();
        this.initInitMethods();
        this._isInitialized = true;
    }
    initDefinitions() {
        if (this._isInitialized) {
            return;
        }
        _.forEach(this.children, injector => injector.initDefinitions());
        let keys = Object.keys(this._definitions);
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], definition = this._definitions[objectId];
            this._prepareInjectParams(definition);
            this._prepareProperties(definition);
            if (definition.factory) {
                this._factories.push(definition.id);
            }
            if (definition.aliasFactory) {
                this._populateAliasFactory(definition, objectId);
            }
        }
    }
    initInstances() {
        if (this._isInitialized) {
            return;
        }
        _.forEach(this.children, injector => injector.initInstances());
        let keys = Object.keys(this._definitions);
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], definition = this._definitions[objectId];
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        }
    }
    initProperties() {
        if (this._isInitialized) {
            return;
        }
        _.forEach(this.children, injector => injector.initProperties());
        let keys = Object.keys(this._instances);
        //loop over instances and inject properties and look up methods only if exist in def
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions[objectId], objectId));
        }
    }
    async initFactories() {
        if (this._isInitialized) {
            return;
        }
        await util_1.Util.runRegroupByParallel(this.children, inject => inject.options.parallel, injector => injector.initFactories());
        for (let factory of this._factories) {
            await this.loadFactory(factory);
        }
    }
    initAlias() {
        if (this._isInitialized) {
            return;
        }
        let keys = Object.keys(this._instances);
        _.forEach(this.children, injector => injector.initAlias());
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            let def = this._definitions[objectId];
            if (def) {
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(def, instance);
                this._injectAliasFactory(def, instance);
            }
        }
    }
    initInitMethods() {
        if (this._isInitialized) {
            return;
        }
        let keys = Object.keys(this._instances);
        _.forEach(this.children, injector => injector.initInitMethods());
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
        }
        this._isInitialized = true;
    }
    _prepareInjectParams(def) {
        let $self = this;
        if (!def.type) {
            return;
        }
        let params = Reflect.getMetadata(decorators_1.InjectParamSymbol, def.type);
        if (!params || !_.isFunction(def.type)) {
            return;
        }
        let paramGroups = _.groupBy(params, "method");
        _.forEach(paramGroups, (items, method) => {
            let oldFn = def.type.prototype[method];
            oldFn = oldFn.originFn || oldFn;
            def.type.prototype[method] = function (...args) {
                for (let i = 0, length = (items.length || 0); i < length; i++) {
                    args[items[i].index] = $self.getObject(items[i].param);
                }
                return oldFn.apply(this, args);
            };
            def.type.prototype[method].originFn = oldFn;
        });
    }
    getObject(objectID, runtimeArgs) {
        return this.get(objectID, runtimeArgs);
    }
    resolve(objectID, runtimeArgs) {
        try {
            return this.get(objectID, runtimeArgs);
        }
        catch (e) {
            return null;
        }
    }
    get(objectID, runtimeArgs) {
        objectID = util_1.Util.getClassNameOrId(objectID);
        let def = this._definitions[objectID];
        if (def && def.factory) {
            return this.getFactoryValue(objectID, def);
        }
        return this._get(objectID, runtimeArgs);
    }
    getFactoryValue(objectID, definitions) {
        let def = definitions || this._definitions[objectID];
        if (!def) {
            return this.parent ? this.parent.getFactoryValue(objectID) : null;
        }
        if (def.injector) {
            return def.injector.getFactoryValue(def.refName || def.id);
        }
        return this._factoriesValues[def.id];
    }
    async getFactory(objectID, refs) {
        if (!refs) {
            refs = { ids: {}, paths: [] };
        }
        objectID = util_1.Util.getClassNameOrId(objectID);
        let def = this._definitions[objectID];
        if (!def) {
            return this.parent ? this.parent.getFactory(objectID, refs) : null;
        }
        if (def.injector) {
            return def.injector.getFactory(def.refName || def.id, refs);
        }
        if (refs.ids[objectID]) {
            throw new Error(`Factory circular reference ${refs.paths.concat(objectID).join("-->")}`);
        }
        refs.paths.push(objectID);
        refs.ids[objectID] = true;
        let value = this._factoriesValues[def.id];
        if (value) {
            return value;
        }
        for (let inject of def.inject) {
            let id = inject.ref || (inject.factory ? inject.factory.id : null);
            if (id) {
                await this.getFactory(id, JSON.parse(JSON.stringify(refs)));
            }
        }
        let factory = this._get(def.id);
        this._wireObjectInstance(factory, def, def.id);
        if (def.factory) {
            value = await factory.get();
            this._factoriesValues[def.id] = value;
            return value;
        }
    }
    _get(objectID, runtimeArgs) {
        let instance = this._instances[objectID];
        if (instance) {
            return instance;
        }
        let def = this._definitions[objectID];
        if (def) {
            return def.injector
                ? def.injector.getObject(def.refName || objectID, runtimeArgs)
                : this._createObjectInstance(objectID, this._definitions[objectID], runtimeArgs);
        }
        if (this.parent) {
            return this.parent.getObject(objectID, runtimeArgs);
        }
        throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
    }
    getInstance(id) {
        let instance = this._instances[id];
        if (instance) {
            return instance;
        }
        if (this.parent) {
            return this.parent.getInstance(id);
        }
        return null;
    }
    hasInstance(id) {
        return !!this.getInstance(id);
    }
    addDefinition(objectId, definition) {
        //we have definition and is already override mode so we do nothing
        if (this._definitions[objectId] && this._definitions[objectId].override && !definition.override) {
            return this;
        }
        //we have definition and the new definition is not in override mode so we throw error
        if (this._definitions[objectId] && !definition.override) {
            throw new Error(`Injector:definition id ${objectId} already exists use override decorator`);
        }
        definition = _.defaults(definition, { id: objectId, args: [], inject: [], alias: [], aliasFactory: [] });
        this._definitions[objectId] = definition;
        return this;
    }
    removeDefinition(objectId) {
        delete this._definitions[objectId];
        return this;
    }
    addDefinitions(definitions) {
        if (definitions instanceof Map) {
            definitions.forEach((value, key) => this.addDefinition(key, value));
        }
        else {
            for (let key in definitions) {
                if (definitions.hasOwnProperty(key)) {
                    this.addDefinition(key, definitions[key]);
                }
            }
        }
        return this;
    }
    addObject(objectId, instance, silent) {
        return this.addInstance(objectId, instance, silent);
    }
    addInstance(objectId, instance, silent) {
        if (!silent && this._instances[objectId]) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }
        this._instances[objectId] = instance;
        return this;
    }
    removeInstance(objectId) {
        delete this._instances[objectId];
        return this;
    }
    getObjectsByType(type) {
        let output = [];
        for (let key in this._instances) {
            if (this._instances.hasOwnProperty(key) && this._instances[key] instanceof type) {
                output.push(this._instances[key]);
            }
        }
        return output;
    }
    getInstances() {
        return this._instances;
    }
    getDefinitions() {
        return this._definitions;
    }
    getDefinitionsValue() {
        return _.values(this._definitions);
    }
    getTypes() {
        return this.getDefinitionsValue().map(item => item.type);
    }
    hasDefinition(id) {
        return !!this.getDefinition(id);
    }
    getDefinition(id) {
        let def = this._definitions[id];
        if (def) {
            return def.injector ? def.injector.getDefinition(def.refName || id) : def;
        }
        if (this.parent) {
            return this.parent.getDefinition(id);
        }
    }
    addAlias(aliasName, value) {
        this.getAlias(name).push(value);
    }
    removeAlias(aliasName, value) {
        _.pull(this.getAlias(name), value);
    }
    getAlias(aliasName) {
        return this._alias[aliasName] = this._alias[aliasName] || (this.parent ? this.parent.getAlias(aliasName) : []) || [];
    }
    addAliasFactory(aliasName, value) {
        this.getAliasFactory(name).push(value);
    }
    removeAliasFactory(aliasName, value) {
        _.pull(this.getAliasFactory(name), value);
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory[aliasName] = this._aliasFactory[aliasName] || (this.parent ? this.parent.getAliasFactory(aliasName) : []) || [];
    }
    getFactoryMethod(objectId) {
        return util_1.Util.createDelegate(this.get, this, [objectId]);
    }
    registerMulti(fns) {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }
        return this;
    }
    register(id, type, filePath) {
        if (_.isFunction(id)) {
            type = id;
            id = util_1.Util.getClassName(type);
        }
        let define = type
            ? (Reflect.getMetadata(decorators_1.InjectDefineSymbol, type) || new define_1.Define(id, type))
            : new define_1.Define(id);
        define.path(filePath);
        this.addDefinition(define.definition.id || id, define.definition);
        return define;
    }
    _createObjectInstance(objectID, def, runtimeArgs) {
        let args = runtimeArgs || [], instance;
        if (!def) {
            throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
        }
        instance = this._instances[objectID];
        if (instance) {
            return instance;
        }
        //loop over args and get the arg value or create arg object instance
        if (def.args.length) {
            let defArgs = [];
            for (let i = 0, length = def.args.length; i < length; i++) {
                let arg = def.args[i];
                defArgs.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, []));
            }
            args = [...defArgs, ...args];
        }
        try {
            instance = args.length ? new def.type(...args) : new def.type();
        }
        catch (e) {
            throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
        }
        if (def.singleton && def.lazy) {
            this._addSingletonAliases(def, instance);
            this._wireObjectInstance(instance, def, objectID);
            this._instances[objectID] = instance;
        }
        else if (def.singleton) {
            this._addSingletonAliases(def, instance);
            this._instances[objectID] = instance;
        }
        else {
            this._wireObjectInstance(instance, def, objectID);
        }
        if (def.injectorAware) {
            instance.$injector = this;
        }
        return instance;
    }
    _addSingletonAliases(def, instance) {
        if (def.alias) {
            let keys = Object.keys(def.alias);
            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                util_1.Util.mapPush(this._alias, def.alias[key], instance);
            }
        }
    }
    _populateAliasFactory(definition, objectId) {
        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {
            let aliasName = definition.aliasFactory[i];
            let delegateFn = util_1.Util.createDelegate(this._get, this, [objectId]);
            delegateFn.type = definition.type;
            util_1.Util.mapPush(this._aliasFactory, aliasName, delegateFn);
        }
    }
    _invokeInitMethod(instance, definition) {
        if (instance[IsWiredSymbol]) {
            return;
        }
        if (definition.initMethod) {
            instance[definition.initMethod]();
        }
        instance[IsWiredSymbol] = true;
    }
    _prepareProperties(definition) {
        let properties = definition.props || definition.properties || [];
        for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
            let injectable = definition.inject[i];
            let dto = injectable;
            if (_.isString(injectable)) {
                dto = {
                    name: injectable,
                    ref: injectable
                };
            }
            if (dto.parent && dto.parent !== definition.type) {
                dto.injector = this._children.find(injector => !!injector.getDefinitionsValue().find(def => def.type === dto.parent));
            }
            let injector = dto.injector || this;
            if (dto.ref) {
                let refDef = injector.getDefinition(dto.ref), localDef = this._definitions[dto.ref], localInjectorDef = localDef && localDef.injector && (localDef.injector.getDefinition(localDef.refName || localDef.id)), factory;
                if (localInjectorDef && localInjectorDef.factory) {
                    //try to get local def factory from child injector
                    factory = { id: localDef.refName || localDef.id, injector: localDef.injector };
                }
                else if (refDef && refDef.factory) {
                    factory = { id: refDef.id, injector: dto.injector };
                }
                //wohoo we found a factory update the property
                if (factory) {
                    dto.factory = factory;
                    delete dto.ref;
                }
                if (refDef) {
                    if (refDef.lazyFn) {
                        dto.lazyFn = refDef.lazyFn;
                        delete dto.ref;
                    }
                    if (!refDef.singleton) {
                        dto.lazy = true;
                    }
                }
            }
            properties.push(dto);
        }
        definition.properties = properties;
    }
    _wireObjectInstance(instance, definition, objectId) {
        if (instance[IsWiredSymbol]) {
            return;
        }
        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods(instance, definition, objectId);
        this._injectFactoryObject(instance, objectId);
        this._injectAlias(definition, instance);
        this._injectAliasFactory(definition, instance);
        this._invokeInitMethod(instance, definition);
        instance[IsWiredSymbol] = true;
    }
    _getByParamObj(propObj, ref, args) {
        return propObj.injector ? propObj.injector._get(ref, args) : this._get(ref, args);
    }
    _injectPropertiesAndLookUpMethods(object, objectDefinition, objectId) {
        if (object[IsWiredSymbol]) {
            return;
        }
        let obj, properties = objectDefinition.properties;
        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            if (prop.array) {
                object[prop.name] = _.map(prop.array, (propObj) => propObj.value || this._getByParamObj(propObj, propObj.ref));
            }
            else if (prop.dictionary) {
                let injectObject = {};
                _.forEach(prop.dictionary, (propObj) => injectObject[propObj.key] = propObj.value || this._getByParamObj(propObj, propObj.ref));
                object[prop.name] = injectObject;
            }
            else if (prop.value) {
                object[prop.name] = prop.value;
            }
            else if (prop.ref) { //check if we have ref and we don't have factory with the same name
                if (prop.lazy) {
                    this._defineProperty(object, prop.name, util_1.Util.createDelegate(this._getByParamObj, this, [prop, prop.ref]), true);
                }
                else {
                    object[prop.name] = this._getByParamObj(prop, prop.ref);
                }
            }
            else if (prop.objectProperty) {
                obj = this._getByParamObj(prop, prop.objectProperty.object);
                object[prop.name] = obj[prop.objectProperty.property];
            }
            else if (prop.factory) {
                if (!this._factoriesObjects[objectId]) {
                    this._factoriesObjects[objectId] = {};
                }
                this._factoriesObjects[objectId][prop.name] = prop.factory;
            }
            else if (prop.factoryMethod) {
                object[prop.name] = util_1.Util.createDelegate(this._getByParamObj, this, [prop, prop.factoryMethod]);
            }
            else if (prop.lazyFn) {
                this._defineProperty(object, prop.name, prop.lazyFn);
            }
        }
    }
    _defineProperty(object, name, fn, cache = false) {
        if (!cache) {
            Object.defineProperty(object, name, {
                get() {
                    return fn();
                }
            });
            return;
        }
        let func = fn;
        func.__cached__ = {};
        Object.defineProperty(object, name, {
            get() {
                let cached = func.__cached__[name];
                if (cached) {
                    return cached;
                }
                let value = fn();
                func.__cached__[name] = value;
                return value;
            }
        });
    }
    async loadFactory(objectId) {
        let factoryData = this._factoriesObjects[objectId];
        let keys = Object.keys(factoryData || {});
        for (let propName of keys) {
            let factory = factoryData[propName];
            await this.loadFactory(factory.id);
        }
        this._factoriesValues[objectId] = await this.getFactory(objectId);
    }
    _injectFactoryObject(instance, objectId) {
        if (instance[IsWiredSymbol]) {
            return;
        }
        let factoryData = this._factoriesObjects[objectId];
        if (!factoryData) {
            return;
        }
        let keys = Object.keys(factoryData);
        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i], factory = factoryData[propName];
            instance[propName] = factory.injector ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
        }
    }
    // private _injectFactoryObjectInner(objectId: string) {
    //
    //     if (this._isInitialized) {
    //         return;
    //     }
    //
    //     let def = this._definitions[objectId];
    //
    //     //recursive load all object inject
    //     if (!def || def.$isFactoryWired) {
    //         return;
    //     }
    //
    //     def.$isFactoryWired = true;
    //
    //     for (let i = 0; i < def.inject.length; i++) {
    //
    //         let ref = def.inject[i].ref,
    //             localProp = this._definitions[ref],
    //             prop = this.getDefinition(ref);
    //
    //         if (ref && localProp && prop) {
    //             let instance = this._get(ref);
    //
    //             (localProp.injector ? localProp.injector : this)._injectFactoryObject(instance, prop.id)
    //         }
    //     }
    //
    // }
    _injectAlias(definition, instance) {
        if (instance[IsWiredSymbol]) {
            return;
        }
        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            let injector = prop.injector ? prop.injector : this;
            (prop.alias) && (instance[prop.name] = prop.indexBy
                ? _.keyBy(injector.getAlias(prop.alias), prop.indexBy)
                : injector.getAlias(prop.alias));
        }
    }
    _injectAliasFactory(definition, instance) {
        if (instance[IsWiredSymbol]) {
            return;
        }
        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            let injector = prop.injector ? prop.injector : this;
            (prop.aliasFactory) && (instance[prop.name] = prop.indexBy
                ? _.keyBy(injector.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy])
                : injector.getAliasFactory(prop.aliasFactory));
        }
    }
    reset() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesObjects = {};
    }
}
exports.Injector = Injector;
exports.createContainer = function () {
    return new Injector();
};
//# sourceMappingURL=inject.js.map