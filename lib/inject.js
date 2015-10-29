"use strict";

var _ = require('lodash'),
    path = require('path'),
    Linq = require('./linq');

const FACTORY_POSTFIX = "Factory";

var Injector = class {

    constructor() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factories = [];
        this._alias = {};
        this._aliasFactory = {};
    }

    /*
     * public  loads the context by given definitions object
     */
    initialize(options) {
        this._options = options || {};

        _.extend(this._definitions, this._options.definitions);

        this._wireObjects(this._definitions);
    }

    /*
     * public get object by object Id
     */
    getObject(objectID, runtimeArgs, ignoreFactory) {

        if (this._definitions[objectID + FACTORY_POSTFIX] && !ignoreFactory) { //check if we have factory and it's not ignored
            return this.getObject(objectID + FACTORY_POSTFIX).get();
        }

        var instance = this._instances[objectID];

        if (!instance) {

            instance = this._createObjectInstance(objectID, this._definitions[objectID], runtimeArgs);
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
    }

    addDefinitions(definitions) {

        _.forEach(definitions, function (value, key) {
            this.addDefinition(key, value);
        }, this);

    }

    addObject(objectId, instance) {

        if (this._instances[objectId]) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }

        this._instances[objectId] = instance;
    }

    getObjectsByType(type) {
        var arr = [], objectID;

        for (objectID in this._instances) {
            if (this._instances.hasOwnProperty(objectID)) {

                if (this._instances[objectID] instanceof type) {
                    arr.push(this._instances[objectID]);
                }
            }
        }

        return arr;
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

        var self = this;

        return function () {
            var object = self.getObject(objectId);

            object.run.apply(object, arguments);
        }
    }

    define(id, type) {

        return new Linq(this,id,type)
    }


    reset() {

        this._instances = {};

        this._definitions = {};

        this._options = {};

        this._alias = {};
        this._aliasFactory = {};

        this._factories.length = 0;
    }

    _createObjectInstance(objectID, objectDefinition, runtimeArgs, referenceChain) {
        var argumentInstances = [],
            referenceChain = referenceChain || [],
            args = [],
            newObjectInstance,
            Func,
            arg,
            argValue;

        //check Circular reference
        if (_.contains(referenceChain, objectID)) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`)
        }

        referenceChain.push(objectID)

        //checks if we have a valid object definition
        if (!objectDefinition) {
            throw new Error("Injector:can't find object definition for objectID:" + objectID);
        }

        newObjectInstance = this._instances[objectID];

        //	If the instance does not already exist make it
        if (!newObjectInstance) {

            //convert path to type
            if (objectDefinition.path) {
                objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'))
            }

            args = ((objectDefinition.args && objectDefinition.args.length >0)
                    ? objectDefinition.args
                    : _(this.getFunctionArgs(objectDefinition.type)).reject(arg =>!this._definitions[arg]).map(arg=>({ref: arg})).value())
                || [];

            //add runtime args to the end of args obj
            _.forEach(runtimeArgs, arg=> args.push({value: arg}));


            //loop over args and get the arg value or create arg object instance
            argumentInstances = _.map(args, arg => _.has(arg, 'value') ? arg.value : this._createObjectInstance(arg.ref, this._definitions[arg.ref], [], referenceChain));

            try {
                //crate object instance
                newObjectInstance = new (Function.prototype.bind.apply(objectDefinition.type, [objectDefinition.type].concat(argumentInstances)));
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
        }

        return newObjectInstance;
    }

    /*
     * private creates new objects instances and inject properties
     */
    _wireObjects(definitions) {

        //add aliasFactory
        _.forEach(definitions, (definition, objectId) => {

            if (definition.aliasFactory) {
                _.forEach(definition.aliasFactory, aliasName =>
                    ((this._aliasFactory[aliasName]) || (this._aliasFactory[aliasName] = [])).push(this._createDelegate(this.getObject, this, [objectId])))
            }
        });


        _.forEach(definitions, (definition, objectId) => {
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        });

        //loop over instances and inject properties and look up methods only if exist in def
        _.forEach(this._instances, (instance, objectId) => {

            (definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, definitions[objectId], objectId));
        });

        _.forEach(this._instances, (instance, objectId) => {
            if(definitions[objectId]){
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(definitions[objectId], instance);
                this._injectAliasFactory(definitions[objectId], instance);
            }
        });

        //loop instances and invoke init methods
        _.forEach(this._instances, (instance, objectId) => {
            (definitions[objectId]) &&  (this._invokeInitMethod(instance, definitions[objectId]));
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
        var properties = objectDefinition.props || objectDefinition.properties || [];

        if (!objectDefinition.$propertiesGenerated) {

            _.forEach(objectDefinition.inject, (injectable) =>
                properties.push(_.isString(injectable) ? ({name: injectable, ref: injectable}) : injectable));

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
        var prop,
            propObj,
            injectObject,
            obj,
            factoryRef,
            properties = this._getProperties(objectDefinition);

        //loop over the properties definition
        _.forEach(properties, function (prop) {

            //get property obj
            injectObject = null;
            factoryRef = prop.ref + FACTORY_POSTFIX;

            if (prop.array) {

                injectObject = _.map(prop.array, propObj=>propObj.value || this.getObject(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};

                _.forEach(prop.dictionary, propObj=> injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref));

            }
            else if (prop.value) {

                injectObject = prop.value;

            }
            else if (prop.ref && !this._definitions[factoryRef]) { //check if we have ref and we don't have factory with the same name

                injectObject = this.getObject(prop.ref);

            }
            else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);

                injectObject = obj[prop.objectProperty.property];

            }
            else if (prop.factory || this._definitions[factoryRef]) {

                if (factoryRef == objectId) {  //check if we trying  to inject to factory with the same name

                    injectObject = this.getObject(prop.ref, [], true);

                }
                else {

                    var factoryName = prop.factory || factoryRef;

                    if (!this._factories[objectId]) {
                        this._factories[objectId] = {};
                    }

                    this._factories[objectId][prop.name] = factoryName;
                }

            }
            else if (prop.factoryMethod) {

                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod])
            }

            if (injectObject) {
                object[prop.name] = injectObject;
            }
        }, this)

        if (objectDefinition.injectorAware) {
            object.$injector = this;
        }

        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            _.forEach(objectDefinition.alias, aliasName =>
                ((this._alias[aliasName]) || (this._alias[aliasName] = [])).push(object));
        }
    }

    _injectFactoryObject(object, objectId) {

        var factoryData = this._factories[objectId];

        if (factoryData) {
            _.forEach(factoryData, (factory, propName) =>object[propName] = this.getObject(factory).get());
        }
    }

    _injectAlias(definition, instance) {

        _.forEach(definition.properties, prop => (prop.alias) && (instance[prop.name] = this.getAlias(prop.alias)))
    }

    _injectAliasFactory(definition, instance) {

        _.forEach(definition.properties, prop => (prop.aliasFactory) && (instance[prop.name] = this.getAliasFactory(prop.aliasFactory)))
    }

    _createDelegate(fn, obj, args) {
        return function () {

            var callArgs = (args || []).concat(arguments);

            return fn.apply(obj, callArgs);
        };
    }

    getFunctionArgs(func) {

        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
            ARGUMENT_NAMES = /([^\s,]+)/g,
            fnStr = func.toString().replace(STRIP_COMMENTS, ''),
            args = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];

        return _.compact(args);
    }
}

module.exports.createContainer = function () {
    return new Injector();
};
