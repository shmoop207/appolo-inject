"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const define_1 = require("./define");
const decorators_1 = require("./decorators");
const util_1 = require("./util");
class Injector {
    constructor() {
        this.FACTORY_POSTFIX = "Factory";
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
    get children() {
        return this._children;
    }
    async initialize(options) {
        this._options = options || {};
        _.forEach(this._options.definitions, (def, id) => this.addDefinition(id, def));
        //we have parent so we wait until parent.initialize
        if (this.parent) {
            return;
        }
        this.initDefinitions();
        this.initInstances();
        this.initProperties();
        await this.initFactories();
        this.initAlias();
        this.initInitMethods();
    }
    initDefinitions() {
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
        _.forEach(this.children, injector => injector.initInstances());
        let keys = Object.keys(this._definitions);
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], definition = this._definitions[objectId];
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        }
    }
    initProperties() {
        _.forEach(this.children, injector => injector.initProperties());
        let keys = Object.keys(this._instances);
        //loop over instances and inject properties and look up methods only if exist in def
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions[objectId], objectId));
        }
    }
    async initFactories() {
        await Promise.all(this.children.map(injector => injector.initFactories()));
        for (let factory of this._factories) {
            await this.loadFactory(factory);
        }
    }
    initAlias() {
        let keys = Object.keys(this._instances);
        _.forEach(this.children, injector => injector.initAlias());
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            if (this._definitions[objectId]) {
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(this._definitions[objectId], instance);
                this._injectAliasFactory(this._definitions[objectId], instance);
            }
        }
    }
    initInitMethods() {
        let keys = Object.keys(this._instances);
        _.forEach(this.children, injector => injector.initInitMethods());
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
        }
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
        return this.get(objectID, runtimeArgs);
    }
    get(objectID, runtimeArgs) {
        objectID = util_1.Util.getClassNameOrId(objectID);
        return this._get(objectID, runtimeArgs);
    }
    getFactoryValue(objectID) {
        let def = this._definitions[objectID];
        if (!def) {
            return this.parent ? this.parent.getFactoryValue(objectID) : null;
        }
        if (def.injector) {
            return def.injector.getFactoryValue(def.id);
        }
        return this._factoriesValues[def.id];
    }
    async getFactory(objectID) {
        objectID = util_1.Util.getClassNameOrId(objectID);
        let def = this._definitions[objectID] || this._definitions[objectID + this.FACTORY_POSTFIX];
        if (!def) {
            return this.parent ? this.parent.getFactory(objectID) : null;
        }
        if (def.injector) {
            return def.injector.getFactory(def.id);
        }
        let value = this._factoriesValues[def.id];
        if (value) {
            return value;
        }
        let factory = this._get(def.id);
        this._injectFactoryObject(this._instances[def.id], def.id);
        value = await factory.get();
        this._factoriesValues[def.id] = value;
        return value;
    }
    _get(objectID, runtimeArgs, referenceChain = []) {
        let instance = this._instances[objectID];
        if (instance) {
            return instance;
        }
        let definition = this._definitions[objectID];
        if (definition) {
            return definition.injector
                ? definition.injector.getObject(objectID, runtimeArgs)
                : this._createObjectInstance(objectID, this._definitions[objectID], runtimeArgs, referenceChain);
        }
        if (this.parent) {
            return this.parent.getObject(objectID);
        }
        throw new Error(`Injector:can't find object definition for objectID:${objectID} ${referenceChain.join(' -> ')}}`);
    }
    getInstance(objectId) {
        return this._instances[objectId];
    }
    addDefinition(objectId, definition) {
        if (this._definitions[objectId]) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }
        definition.id = objectId;
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
    getDefinition(id) {
        let def = this._definitions[id];
        if (def) {
            return def.injector ? def.injector.getDefinition(id) : def;
        }
        if (this.parent) {
            return this.parent.getDefinition(id);
        }
    }
    getAlias(aliasName) {
        return this._alias[aliasName] || (this.parent ? this.parent.getAlias(aliasName) : []) || [];
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory[aliasName] || (this.parent ? this.parent.getAliasFactory(aliasName) : []) || [];
    }
    delegate(objectId) {
        let self = this;
        return function () {
            let object = self._get(objectId);
            object.run.apply(object, arguments);
        };
    }
    registerMulti(fns) {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }
        return this;
    }
    register(id, type) {
        if (_.isFunction(id)) {
            type = id;
            id = util_1.Util.getClassName(type);
        }
        let define = type
            ? (Reflect.getMetadata(decorators_1.InjectDefineSymbol, type) || new define_1.Define(id, type))
            : new define_1.Define(id);
        this.addDefinition(id, define.definition);
        return define;
    }
    _createObjectInstance(objectID, objectDefinition, runtimeArgs, referenceChain = []) {
        let argumentInstances = runtimeArgs || [], args, newObjectInstance;
        if (referenceChain.length && referenceChain.indexOf(objectID) > -1) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`);
        }
        referenceChain.push(objectID);
        if (!objectDefinition) {
            throw new Error(`Injector:can't find object definition for objectID:${objectID} ${referenceChain.join(' -> ')}}`);
        }
        newObjectInstance = this._instances[objectID];
        if (newObjectInstance) {
            return newObjectInstance;
        }
        //loop over args and get the arg value or create arg object instance
        if (objectDefinition.args && objectDefinition.args.length) {
            let args = [];
            for (let i = 0, length = objectDefinition.args.length; i < length; i++) {
                let arg = objectDefinition.args[i];
                args.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, [], referenceChain));
            }
            argumentInstances = [...args, ...argumentInstances];
        }
        try {
            newObjectInstance = new objectDefinition.type(...argumentInstances);
        }
        catch (e) {
            throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
        }
        if (objectDefinition.singleton && objectDefinition.lazy) {
            this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
            this._instances[objectID] = newObjectInstance;
        }
        else if (objectDefinition.singleton) {
            this._instances[objectID] = newObjectInstance;
        }
        else {
            this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
        }
        return newObjectInstance;
    }
    _populateAliasFactory(definition, objectId) {
        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {
            let aliasName = definition.aliasFactory[i];
            let delegateFn = util_1.Util.createDelegate(this._get, this, [objectId]);
            delegateFn.type = definition.type;
            util_1.Util.mapPush(this._aliasFactory, aliasName, delegateFn);
        }
    }
    _invokeInitMethod(object, definition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
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
            if (dto.ref) {
                let factoryRef = dto.ref + this.FACTORY_POSTFIX, factoryDef = this.getDefinition(factoryRef), refDef = this.getDefinition(dto.ref), localDef = this._definitions[dto.ref], localInjectorDef = localDef && localDef.injector && localDef.injector.getDefinition(factoryRef), factory;
                if (localInjectorDef && localInjectorDef.factory) {
                    //try to get local def factory from child injector
                    factory = { id: factoryRef, injector: localDef.injector };
                }
                else if (refDef && refDef.factory) {
                    factory = { id: refDef.id };
                }
                else if (factoryDef && factoryDef.factory && definition.id != factoryRef) {
                    factory = { id: factoryRef };
                }
                //wohoo we found a factory update the property
                if (factory) {
                    dto.factory = factory;
                    delete dto.ref;
                }
            }
            properties.push(dto);
        }
        definition.properties = properties;
    }
    _wireObjectInstance(object, definition, objectId) {
        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods(object, definition, objectId);
        this._injectFactoryObject(object, objectId);
        this._injectAlias(definition, object);
        this._injectAliasFactory(definition, object);
        this._invokeInitMethod(object, definition);
        definition.singleton && (definition.$isWired = true);
    }
    _injectPropertiesAndLookUpMethods(object, objectDefinition, objectId) {
        let injectObject, obj, properties = objectDefinition.properties;
        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            injectObject = null;
            if (prop.array) {
                injectObject = _.map(prop.array, (propObj) => propObj.value || this._get(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};
                _.forEach(prop.dictionary, (propObj) => injectObject[propObj.key] = propObj.value || this._get(propObj.ref));
            }
            else if (prop.value) {
                injectObject = prop.value;
            }
            else if (prop.ref) { //check if we have ref and we don't have factory with the same name
                injectObject = this._get(prop.ref);
            }
            else if (prop.objectProperty) {
                obj = this._get(prop.objectProperty.object);
                injectObject = obj[prop.objectProperty.property];
            }
            else if (prop.factory) {
                if (!this._factoriesObjects[objectId]) {
                    this._factoriesObjects[objectId] = {};
                }
                this._factoriesObjects[objectId][prop.name] = prop.factory;
            }
            else if (prop.factoryMethod) {
                injectObject = util_1.Util.createDelegate(this._get, this, [prop.factoryMethod]);
            }
            if (injectObject) {
                object[prop.name] = injectObject;
            }
        }
        if (objectDefinition.injectorAware) {
            object.$injector = this;
        }
        if (objectDefinition.alias && objectDefinition.singleton) {
            let keys = Object.keys(objectDefinition.alias);
            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                util_1.Util.mapPush(this._alias, objectDefinition.alias[key], object);
            }
        }
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
    _injectFactoryObject(object, objectId) {
        let factoryData = this._factoriesObjects[objectId];
        if (!factoryData) {
            return;
        }
        let keys = Object.keys(factoryData);
        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i], factory = factoryData[propName];
            object[propName] = factory.injector ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
        }
    }
    _injectAlias(definition, instance) {
        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            (prop.alias) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAlias(prop.alias), prop.indexBy) : this.getAlias(prop.alias));
        }
    }
    _injectAliasFactory(definition, instance) {
        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            (prop.aliasFactory) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy]) : this.getAliasFactory(prop.aliasFactory));
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