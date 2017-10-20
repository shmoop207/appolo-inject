"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const define_1 = require("./define");
class Injector {
    constructor() {
        this.FACTORY_POSTFIX = "Factory";
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factories = {};
        this._alias = {};
        this._aliasFactory = {};
    }
    /*
     * public  loads the context by given definitions object
     */
    initialize(options) {
        this._options = options || {};
        for (let key in this._options.definitions) {
            if (this._options.definitions.hasOwnProperty(key)) {
                this._definitions[key] = this._options.definitions[key];
            }
        }
        this._wireObjects();
        return this;
    }
    /*
     * public get object by object Id
     */
    getObject(objectID, runtimeArgs, ignoreFactory) {
        return this._get(objectID, runtimeArgs, ignoreFactory);
    }
    resolve(objectID, runtimeArgs) {
        return this._get(objectID, runtimeArgs);
    }
    get(objectID, runtimeArgs) {
        return this._get(objectID, runtimeArgs);
    }
    _get(objectID, runtimeArgs, ignoreFactory, referenceChain = []) {
        //check if we have factory and it's not ignored
        if (!ignoreFactory && this._definitions[(objectID + this.FACTORY_POSTFIX)]) {
            return this.getObject(objectID + this.FACTORY_POSTFIX).get();
        }
        let instance = this._instances[objectID];
        if (!instance) {
            instance = this._createObjectInstance(objectID, this._definitions[objectID], runtimeArgs, referenceChain);
        }
        return instance;
    }
    getInstance(objectId) {
        return this._instances[objectId];
    }
    addDefinition(objectId, definition) {
        if (this._definitions[objectId]) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }
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
    addObject(objectId, instance) {
        return this.addInstance(objectId, instance);
    }
    addInstance(objectId, instance) {
        if (this._instances[objectId]) {
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
        return this._definitions[id];
    }
    getAlias(aliasName) {
        return this._alias[aliasName] || [];
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory[aliasName] || [];
    }
    delegate(objectId) {
        let self = this;
        return function () {
            let object = self.getObject(objectId);
            object.run.apply(object, arguments);
        };
    }
    define(id, type) {
        return new define_1.Define(this, id, type);
    }
    reset() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factories = {};
    }
    _createObjectInstance(objectID, objectDefinition, runtimeArgs, referenceChain = []) {
        let argumentInstances = [], args, newObjectInstance;
        //check Circular reference
        if (referenceChain.indexOf(objectID) > -1) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`);
        }
        referenceChain.push(objectID);
        //checks if we have a valid object definition
        if (!objectDefinition) {
            throw new Error("Injector:can't find object definition for objectID:" + objectID);
        }
        newObjectInstance = this._instances[objectID];
        //	If the instance does not already exist make it
        if (newObjectInstance) {
            return newObjectInstance;
        }
        //convert path to type
        if (objectDefinition.path) {
            objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'));
        }
        args = (objectDefinition.args && objectDefinition.args.length > 0) ? objectDefinition.args : [];
        //add runtime args to the end of args obj
        for (let i = 0, length = (runtimeArgs ? runtimeArgs.length : 0); i < length; i++) {
            args.push({ value: runtimeArgs[i] });
        }
        //loop over args and get the arg value or create arg object instance
        for (let i = 0, length = (args ? args.length : 0); i < length; i++) {
            let arg = args[i];
            argumentInstances.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, [], false, referenceChain));
        }
        try {
            //crate object instance
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
    /*
     * private creates new objects instances and inject properties
     */
    _wireObjects() {
        //add aliasFactory
        for (let objectId in this._definitions) {
            if (this._definitions.hasOwnProperty(objectId)) {
                let definition = this._definitions[objectId];
                if (definition.aliasFactory) {
                    this._populateAliasFactory(definition, objectId);
                }
            }
        }
        for (let objectId in this._definitions) {
            if (this._definitions.hasOwnProperty(objectId)) {
                let definition = this._definitions[objectId];
                (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
            }
        }
        //loop over instances and inject properties and look up methods only if exist in def
        for (let objectId in this._instances) {
            if (this._instances.hasOwnProperty(objectId)) {
                let instance = this._instances[objectId];
                (this._definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions[objectId], objectId));
            }
        }
        for (let objectId in this._instances) {
            if (this._instances.hasOwnProperty(objectId)) {
                let instance = this._instances[objectId];
                if (this._definitions[objectId]) {
                    this._injectFactoryObject(instance, objectId);
                    this._injectAlias(this._definitions[objectId], instance);
                    this._injectAliasFactory(this._definitions[objectId], instance);
                }
            }
        }
        //loop instances and invoke init methods
        for (let objectId in this._instances) {
            if (this._instances.hasOwnProperty(objectId)) {
                let instance = this._instances[objectId];
                (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
            }
        }
    }
    _populateAliasFactory(definition, objectId) {
        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {
            let aliasName = definition.aliasFactory[i];
            let delegateFn = this._createDelegate(this.getObject, this, [objectId]);
            delegateFn.type = definition.type;
            this._mapPush(this._aliasFactory, aliasName, delegateFn);
        }
    }
    /*
     * invoke the init method of given object
     */
    _invokeInitMethod(object, definition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
    }
    _getProperties(objectDefinition) {
        let properties = objectDefinition.props || objectDefinition.properties || [];
        if (!objectDefinition.$propertiesGenerated) {
            for (let i = 0, length = (objectDefinition.inject ? objectDefinition.inject.length : 0); i < length; i++) {
                let injectable = objectDefinition.inject[i];
                properties.push(_.isString(injectable) ? ({
                    name: injectable,
                    ref: injectable
                }) : injectable);
            }
            objectDefinition.properties = properties;
            objectDefinition.$propertiesGenerated = true;
        }
        return properties;
    }
    /*
     * private  fire single object instance
     */
    _wireObjectInstance(object, definition, objectId) {
        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods(object, definition, objectId);
        this._injectFactoryObject(object, objectId);
        this._injectAlias(definition, object);
        this._injectAliasFactory(definition, object);
        //invoke init method
        this._invokeInitMethod(object, definition);
        definition.singleton && (definition.$isWired = true);
    }
    /*
     * private inject values and look up methods to object properties
     */
    _injectPropertiesAndLookUpMethods(object, objectDefinition, objectId) {
        let injectObject, obj, factoryRef, properties = this._getProperties(objectDefinition);
        //loop over the properties definition
        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            //get property obj
            injectObject = null;
            factoryRef = prop.ref + this.FACTORY_POSTFIX;
            if (prop.array) {
                injectObject = _.map(prop.array, (propObj) => propObj.value || this.getObject(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};
                _.forEach(prop.dictionary, (propObj) => injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref));
            }
            else if (prop.value) {
                injectObject = prop.value;
            }
            else if (prop.ref && !this._definitions[factoryRef]) {
                injectObject = this.getObject(prop.ref);
            }
            else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);
                injectObject = obj[prop.objectProperty.property];
            }
            else if (prop.factory || this._definitions[factoryRef]) {
                if (factoryRef == objectId) {
                    injectObject = this._get(prop.ref, [], true);
                }
                else {
                    let factoryName = prop.factory || factoryRef;
                    if (!this._factories[objectId]) {
                        this._factories[objectId] = {};
                    }
                    this._factories[objectId][prop.name] = factoryName;
                }
            }
            else if (prop.factoryMethod) {
                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod]);
            }
            if (injectObject) {
                object[prop.name] = injectObject;
            }
        }
        if (objectDefinition.injectorAware) {
            object.$injector = this;
        }
        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            for (let key in objectDefinition.alias) {
                if (objectDefinition.alias.hasOwnProperty(key)) {
                    this._mapPush(this._alias, objectDefinition.alias[key], object);
                }
            }
        }
    }
    _injectFactoryObject(object, objectId) {
        let factoryData = this._factories[objectId];
        if (factoryData) {
            for (let propName in factoryData) {
                if (factoryData.hasOwnProperty(propName)) {
                    let factory = factoryData[propName];
                    object[propName] = this.getObject(factory).get();
                }
            }
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
    _createDelegate(fn, obj, args) {
        return function () {
            let callArgs = (args || []).concat(arguments);
            return fn.apply(obj, callArgs);
        };
    }
    _mapPush(map, key, obj) {
        (!map[key]) && (map[key] = []);
        map[key].push(obj);
    }
    _getFunctionArgs(func) {
        let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, ARGUMENT_NAMES = /([^\s,]+)/g, fnStr = func.toString().replace(STRIP_COMMENTS, '').replace(/(\r\n|\n|\r|\t| )/gm, ""), args = fnStr.slice(fnStr.indexOf('constructor(') + 12, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];
        return _.compact(args);
    }
}
exports.Injector = Injector;
exports.createContainer = function () {
    return new Injector();
};
//# sourceMappingURL=inject.js.map