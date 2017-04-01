"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const define_1 = require("./define");
class Injector {
    constructor() {
        this.FACTORY_POSTFIX = "Factory";
        this._instances = new Map();
        this._definitions = new Map();
        this._options = {};
        this._factories = new Map();
        this._alias = new Map();
        this._aliasFactory = new Map();
    }
    /*
     * public  loads the context by given definitions object
     */
    initialize(options) {
        this._options = options || {};
        _.forEach(this._options.definitions, (value, key) => this._definitions.set(key, value));
        this._wireObjects();
        return this;
    }
    /*
     * public get object by object Id
     */
    getObject(objectID, runtimeArgs, ignoreFactory) {
        return this.get(objectID, runtimeArgs, ignoreFactory);
    }
    resolve(objectID, runtimeArgs, ignoreFactory) {
        return this.get(objectID, runtimeArgs, ignoreFactory);
    }
    get(objectID, runtimeArgs, ignoreFactory) {
        //check if we have factory and it's not ignored
        if (this._definitions.has(objectID + this.FACTORY_POSTFIX) && !ignoreFactory) {
            return this.getObject(objectID + this.FACTORY_POSTFIX).get();
        }
        let instance = this._instances.get(objectID);
        if (!instance) {
            instance = this._createObjectInstance(objectID, this._definitions.get(objectID), runtimeArgs);
        }
        return instance;
    }
    getInstance(objectId) {
        return this._instances.get(objectId);
    }
    addDefinition(objectId, definition) {
        if (this._definitions.has(objectId)) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }
        this._definitions.set(objectId, definition);
        return this;
    }
    removeDefinition(objectId) {
        this._definitions.delete(objectId);
        return this;
    }
    addDefinitions(definitions) {
        if (definitions instanceof Map) {
            definitions.forEach((value, key) => this.addDefinition(key, value));
        }
        else {
            _.forEach(definitions, (value, key) => this.addDefinition(key, value));
        }
        return this;
    }
    addObject(objectId, instance) {
        return this.addInstance(objectId, instance);
    }
    addInstance(objectId, instance) {
        if (this._instances.has(objectId)) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }
        this._instances.set(objectId, instance);
        return this;
    }
    removeInstance(objectId) {
        this._instances.delete(objectId);
        return this;
    }
    getObjectsByType(type) {
        return Array.from(this._instances.values()).filter(obj => obj instanceof type);
    }
    getInstances() {
        return this._instances;
    }
    getDefinitions() {
        return this._definitions;
    }
    getDefinition(id) {
        return this._definitions.get(id);
    }
    getAlias(aliasName) {
        return this._alias.get(aliasName) || [];
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory.get(aliasName) || [];
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
        this._instances.clear();
        this._definitions.clear();
        this._options = {};
        this._alias.clear();
        this._aliasFactory.clear();
        this._factories.clear();
    }
    _createObjectInstance(objectID, objectDefinition, runtimeArgs, referenceChain = []) {
        let argumentInstances = [], args = [], newObjectInstance;
        //check Circular reference
        if (_.includes(referenceChain, objectID)) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`);
        }
        referenceChain.push(objectID);
        //checks if we have a valid object definition
        if (!objectDefinition) {
            throw new Error("Injector:can't find object definition for objectID:" + objectID);
        }
        newObjectInstance = this._instances.get(objectID);
        //	If the instance does not already exist make it
        if (!newObjectInstance) {
            //convert path to type
            if (objectDefinition.path) {
                objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'));
            }
            args = ((objectDefinition.args && objectDefinition.args.length > 0)
                ? objectDefinition.args
                : _(this._getFunctionArgs(objectDefinition.type)).reject(arg => !this._definitions.has(arg)).map(arg => ({ ref: arg })).value())
                || [];
            //add runtime args to the end of args obj
            _.forEach(runtimeArgs, arg => args.push({ value: arg }));
            //loop over args and get the arg value or create arg object instance
            argumentInstances = _.map(args, arg => _.has(arg, 'value') ? arg.value : this._createObjectInstance(arg.ref, this._definitions.get(arg.ref), [], referenceChain));
            try {
                //crate object instance
                newObjectInstance = new (Function.prototype.bind.apply(objectDefinition.type, [objectDefinition.type].concat(argumentInstances)));
            }
            catch (e) {
                throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
            }
            if (objectDefinition.singleton && objectDefinition.lazy) {
                this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
                this._instances.set(objectID, newObjectInstance);
            }
            else if (objectDefinition.singleton) {
                this._instances.set(objectID, newObjectInstance);
            }
            else {
                this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
            }
        }
        return newObjectInstance;
    }
    /*
     * private creates new objects instances and inject properties
     */
    _wireObjects() {
        //add aliasFactory
        this._definitions.forEach((definition, objectId) => {
            if (definition.aliasFactory) {
                this._populateAliasFactory(definition, objectId);
            }
        });
        this._definitions.forEach((definition, objectId) => {
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        });
        //loop over instances and inject properties and look up methods only if exist in def
        this._instances.forEach((instance, objectId) => {
            (this._definitions.has(objectId)) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions.get(objectId), objectId));
        });
        this._instances.forEach((instance, objectId) => {
            if (this._definitions.has(objectId)) {
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(this._definitions.get(objectId), instance);
                this._injectAliasFactory(this._definitions.get(objectId), instance);
            }
        });
        //loop instances and invoke init methods
        this._instances.forEach((instance, objectId) => {
            (this._definitions.has(objectId)) && (this._invokeInitMethod(instance, this._definitions.get(objectId)));
        });
    }
    _populateAliasFactory(definition, objectId) {
        _.forEach(definition.aliasFactory, aliasName => {
            let delegateFn = this._createDelegate(this.getObject, this, [objectId]);
            delegateFn.type = definition.type;
            this._mapPush(this._aliasFactory, aliasName, delegateFn);
        });
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
            _.forEach(objectDefinition.inject, (injectable) => properties.push(_.isString(injectable) ? ({
                name: injectable,
                ref: injectable
            }) : injectable));
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
        _.forEach(properties, (prop) => {
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
            else if (prop.ref && !this._definitions.has(factoryRef)) {
                injectObject = this.getObject(prop.ref);
            }
            else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);
                injectObject = obj[prop.objectProperty.property];
            }
            else if (prop.factory || this._definitions.has(factoryRef)) {
                if (factoryRef == objectId) {
                    injectObject = this.getObject(prop.ref, [], true);
                }
                else {
                    let factoryName = prop.factory || factoryRef;
                    if (!this._factories.has(objectId)) {
                        this._factories.set(objectId, {});
                    }
                    this._factories.get(objectId)[prop.name] = factoryName;
                }
            }
            else if (prop.factoryMethod) {
                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod]);
            }
            if (injectObject) {
                object[prop.name] = injectObject;
            }
        });
        if (objectDefinition.injectorAware) {
            object.$injector = this;
        }
        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            _.forEach(objectDefinition.alias, aliasName => this._mapPush(this._alias, aliasName, object));
        }
    }
    _injectFactoryObject(object, objectId) {
        let factoryData = this._factories.get(objectId);
        if (factoryData) {
            _.forEach(factoryData, (factory, propName) => object[propName] = this.getObject(factory).get());
        }
    }
    _injectAlias(definition, instance) {
        _.forEach(definition.properties, (prop) => (prop.alias) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAlias(prop.alias), prop.indexBy) : this.getAlias(prop.alias)));
    }
    _injectAliasFactory(definition, instance) {
        _.forEach(definition.properties, prop => (prop.aliasFactory) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy]) : this.getAliasFactory(prop.aliasFactory)));
    }
    _createDelegate(fn, obj, args) {
        return function () {
            let callArgs = (args || []).concat(arguments);
            return fn.apply(obj, callArgs);
        };
    }
    _mapPush(map, key, obj) {
        (!map.has(key)) && map.set(key, []);
        map.get(key).push(obj);
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