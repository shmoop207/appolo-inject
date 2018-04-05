"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    /*
     * public  loads the context by given definitions object
     */
    initialize(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._options = options || {};
            let keys = Object.keys(this._options.definitions || {});
            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                this._definitions[key] = this._options.definitions[key];
            }
            yield this._wireObjects();
        });
    }
    _wireObjects() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let keys = Object.keys(this._definitions);
            for (let i = 0, len = keys.length; i < len; i++) {
                let objectId = keys[i], definition = this._definitions[objectId];
                this._initInjectParams(definition);
                this._initProperties(definition);
                if (definition.factory) {
                    this._factories.push(definition.id);
                }
                if (definition.aliasFactory) {
                    this._populateAliasFactory(definition, objectId);
                }
            }
            for (let i = 0, len = keys.length; i < len; i++) {
                let objectId = keys[i], definition = this._definitions[objectId];
                (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
            }
            keys = Object.keys(this._instances);
            //loop over instances and inject properties and look up methods only if exist in def
            for (let i = 0, len = keys.length; i < len; i++) {
                let objectId = keys[i], instance = this._instances[objectId];
                (this._definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions[objectId], objectId));
            }
            yield this._loadFactories(this._factories);
            for (let i = 0, len = keys.length; i < len; i++) {
                let objectId = keys[i], instance = this._instances[objectId];
                if (this._definitions[objectId]) {
                    this._injectFactoryObject(instance, objectId);
                    this._injectAlias(this._definitions[objectId], instance);
                    this._injectAliasFactory(this._definitions[objectId], instance);
                }
            }
            //loop instances and invoke init methods
            for (let i = 0, len = keys.length; i < len; i++) {
                let objectId = keys[i], instance = this._instances[objectId];
                (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
            }
        });
    }
    _initInjectParams(def) {
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
            def.type.prototype[method] = function (...args) {
                for (let i = 0, length = (items.length || 0); i < length; i++) {
                    args[items[i].index] = $self.getObject(items[i].param);
                }
                return oldFn.apply(this, args);
            };
        });
    }
    /*
     * public get object by object Id
     */
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
    getFactory(objectID) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            value = yield factory.get();
            this._factoriesValues[def.id] = value;
            return value;
        });
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
        return this.addInstance(objectId, instance);
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
        return this._alias[aliasName] || [];
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory[aliasName] || [];
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
        let define = Reflect.getMetadata(decorators_1.InjectDefineSymbol, type) || new define_1.Define(id, type);
        this.addDefinition(id, define.definition);
        return define;
    }
    _createObjectInstance(objectID, objectDefinition, runtimeArgs, referenceChain = []) {
        let argumentInstances = [], args, newObjectInstance;
        //check Circular reference
        if (referenceChain.length && referenceChain.indexOf(objectID) > -1) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`);
        }
        referenceChain.push(objectID);
        //checks if we have a valid object definition
        if (!objectDefinition) {
            throw new Error(`Injector:can't find object definition for objectID:${objectID} ${referenceChain.join(' -> ')}}`);
        }
        newObjectInstance = this._instances[objectID];
        //	If the instance does not already exist make it
        if (newObjectInstance) {
            return newObjectInstance;
        }
        // //convert path to type
        // if (objectDefinition.path) {
        //     objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'))
        // }
        args = (objectDefinition.args && objectDefinition.args.length > 0) ? objectDefinition.args : [];
        //add runtime args to the end of args obj
        for (let i = 0, length = (runtimeArgs ? runtimeArgs.length : 0); i < length; i++) {
            args.push({ value: runtimeArgs[i] });
        }
        //loop over args and get the arg value or create arg object instance
        for (let i = 0, length = (args ? args.length : 0); i < length; i++) {
            let arg = args[i];
            argumentInstances.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, [], referenceChain));
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
    _populateAliasFactory(definition, objectId) {
        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {
            let aliasName = definition.aliasFactory[i];
            let delegateFn = util_1.Util.createDelegate(this._get, this, [objectId]);
            delegateFn.type = definition.type;
            util_1.Util.mapPush(this._aliasFactory, aliasName, delegateFn);
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
    _initProperties(definition) {
        // if (definition.factory) {
        //     this._factories.push(definition.id);
        // }
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
                let factoryRef = dto.ref + this.FACTORY_POSTFIX, factoryDef = this.getDefinition(factoryRef), refDef = this.getDefinition(dto.ref);
                if (refDef && refDef.factory) {
                    dto.factory = refDef.id;
                    delete dto.ref;
                }
                else if (factoryDef && factoryDef.factory && definition.id != factoryRef) {
                    dto.factory = factoryRef;
                    delete dto.ref;
                }
            }
            properties.push(dto);
        }
        definition.properties = properties;
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
        let injectObject, obj, properties = objectDefinition.properties;
        //loop over the properties definition
        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            //get property obj
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
        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            let keys = Object.keys(objectDefinition.alias);
            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                util_1.Util.mapPush(this._alias, objectDefinition.alias[key], object);
            }
        }
    }
    _loadFactories(factories) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let factory of factories) {
                yield this.loadFactory(factory);
            }
        });
    }
    loadFactory(objectId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let factoryData = this._factoriesObjects[objectId];
            let keys = Object.keys(factoryData || {});
            for (let propName of keys) {
                let factory = factoryData[propName];
                yield this.loadFactory(factory);
            }
            this._factoriesValues[objectId] = yield this.getFactory(objectId);
        });
    }
    _injectFactoryObject(object, objectId) {
        let factoryData = this._factoriesObjects[objectId];
        //let objectDef = this._definitions[objectId];
        if (!factoryData) {
            return;
        }
        let keys = Object.keys(factoryData);
        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i], factory = factoryData[propName];
            //let factoryDef = this._definitions[factory];
            //this._injectFactoryObject(this._instances[factoryDef.id], factoryDef.id);
            //let factoryValue = this._factoriesValues[factory];
            // if(!factoryValue){
            //    factoryValue = this._factoriesValues[factory] =  this._get<IFactory<T>>(factory).get();
            //}
            object[propName] = this.getFactoryValue(factory);
        }
        //objectDef.$isFactoryWired = true;
    }
    // private _injectFactoryObjectSync() {
    //
    // }
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