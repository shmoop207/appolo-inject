"use strict";

var _ = require('lodash'),
    path = require('path'),
    Class = require('appolo-class');


var Injector = Class.define({

    constructor: function () {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factories = [];
    },

    /*
     * public  loads the context by given definitions object
     */
    initialize: function (options) {
        this._options = options || {};

        _.extend(this._definitions, this._options.definitions);

        this._wireObjects(this._definitions);
    },

    /*
     * public get object by object Id
     */
    getObject: function (objectID, runtimeArgs) {
        var instance = this._instances[objectID];

        if (!instance) {

            instance = this._createObjectInstance(objectID, this._definitions[objectID], runtimeArgs);
        }

        return instance;
    },

    addDefinitions: function (definitions) {


        _.forEach(definitions, function (value, key) {

            if (!this._definitions[key]) {
                this._definitions[key] = value;
            } else {
                throw new Error("Injector:definition id already exists:" + key);
            }


        }.bind(this));

    },

    addObject: function (objectId, instance) {
        if (!this._instances[objectId]) {
            this._instances[objectId] = instance;
        } else {
            throw new Error("Injector:object id already exists:" + objectId);
        }
    },

    getObjectsByType: function (type) {
        var arr = [], objectID;

        for (objectID in this._instances) {
            if (this._instances.hasOwnProperty(objectID)) {

                if (this._instances[objectID] instanceof type) {
                    arr.push(this._instances[objectID]);
                }
            }
        }

        return arr;
    },

    getInstances: function () {
        return this._instances;
    },

    getDefinitions: function () {
        return this._definitions;
    },

    getDefinition: function (id) {
        return this._definitions[id];
    },


    _createObjectInstance: function (objectID, objectDefinition, runtimeArgs) {
        var argumentInstances = [],
            commands = [],
            args = [],
            i = 0,
            j = 0,
            newObjectInstance,
            Func,
            arg,
            argValue;

        //checks if we have a valid object definition
        if (!objectDefinition) {
            throw new Error("Injector:can't find object definition for objectID:" + objectID);
        }

        newObjectInstance = this._instances[objectID];

        //	If the instance does not already exist make it
        if (!newObjectInstance) {
            args = objectDefinition.args || [];
            //add runtime args to the end of args obj
            if (runtimeArgs) {
                for (i = 0; i < runtimeArgs.length; i++) {
                    args.push({value: runtimeArgs[i]});
                }
            }

            //loop over args and get the arg value or create arg object instance
            for (i = 0; i < args.length; i++) {
                arg = args[i];

                //if we have arg references to another object we will try to create it
                argValue = arg.value || this._createObjectInstance(arg.ref, this._definitions[arg.ref]);

                //push arg value
                argumentInstances[i] = argValue;

                //store the arg array ref for the eval func
                commands[commands.length] = "argumentInstances[" + i + "]";
            }

            //crate object instance
            try {

                if (typeof objectDefinition.type === 'function') {

                    eval("newObjectInstance = new objectDefinition.type (" + commands.join(",") + ")");

                } else if (objectDefinition.path) {

                    eval("newObjectInstance = new require( path.join(this._options.root, objectDefinition.path + '.js')) (" + commands.join(",") + ")");

                } else if (objectDefinition.type === 'string') {

                    eval("newObjectInstance = new " + objectDefinition.type + " (" + commands.join(",") + ")");

                } else {

                    throw new Error("can't find valid type");
                }

            } catch (e) {
                throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
            }


            if (objectDefinition.singleton && objectDefinition.lazy) {

                this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
                this._instances[objectID] = newObjectInstance;

            } else if (objectDefinition.singleton) {

                this._instances[objectID] = newObjectInstance;

            } else {

                this._wireObjectInstance(newObjectInstance, objectDefinition, objectID);
            }
        }

        return newObjectInstance;
    },


    /*
     * private creates new objects instances and inject properties
     */
    _wireObjects: function (definitions) {

        _.forEach(definitions, function (definition, objectId) {
            if (definition.singleton && !definition.lazy) {
                this._createObjectInstance(objectId, definition);
            }
        }, this);

        //loop over instances and inject properties and look up methods
        _.forEach(this._instances, function (instance, objectId) {

            if (definitions[objectId]) {
                this._injectPropertiesAndLookUpMethods(instance, definitions[objectId], objectId);
            }

        }, this);

        //inject factory
        _.forEach(this._factories, function (factoryObj) {
            var factory = this.getObject(factoryObj.factory);

            factoryObj.object[factoryObj.name] = factory.get();

        }, this);

        //this._factories.length = 0;

        //loop instances and invoke init methods

        _.forEach(this._instances, function (instance, objectId) {
            if (definitions[objectId]) {
                this._invokeInitMethod(instance, definitions[objectId]);
            }
        }, this);

    },

    /*
     * invoke the init method of given object
     */
    _invokeInitMethod: function (object, definition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
    },

    _injectFactoryObject: function (object, definition, objectID) {
        _.forEach(this._factories, function (factoryObj,index) {

            if (factoryObj.object === object) {
                var factory = this.getObject(factoryObj.factory);

                factoryObj.object[factoryObj.name] = factory.get();
            }

        }, this);

        //this._factories.length = 0;

    },

    /*
     * private inject values and look up methods to object properties
     */
    _injectPropertiesAndLookUpMethods: function (object, objectDefinition, objectId) {
        var prop,
            i = 0,
            j = 0,
            length,
            propObj,
            injectObject,
            obj,
            methodToInvoke;

        var properties = objectDefinition.props || objectDefinition.properties || [];

        if (objectDefinition.inject) {
            for (var i = 0, length = objectDefinition.inject.length; i < length; i++) {
                properties.push({
                    name: objectDefinition.inject[i],
                    ref: objectDefinition.inject[i]
                });
            }
        }


        //loop over the properties definition
        for (i = 0; i < properties.length; i++) {
            //get property obj
            prop = properties[i];
            injectObject = null;

            if (prop.array) {
                injectObject = [];

                for (j = 0; j < prop.array.length; j++) {
                    propObj = prop.array[j];
                    injectObject.push(propObj.value || this.getObject(propObj.ref));
                }
            } else if (prop.dictionary) {
                injectObject = {};

                for (j = 0; j < prop.dictionary.length; j++) {
                    propObj = prop.dictionary[j];
                    injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref);
                }
            } else if (prop.value) {

                injectObject = prop.value;

            } else if (prop.ref && !this._definitions[prop.ref + "Factory"]) {
                injectObject = this.getObject(prop.ref);

            } else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);

                injectObject = obj[prop.objectProperty.property];

            } else if (prop.factory || this._definitions[prop.ref + "Factory"]) {

                this._factories.push({
                    object: object,
                    name: prop.name,
                    factory: prop.factory || prop.ref + "Factory"
                });

            } else if (prop.factoryMethod) {

                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod])
            }

            if (injectObject) {
                object[prop.name] = injectObject;
            }


        }

        if (objectDefinition.injectorAware) {
            object.$injector = this;
        }

    },

    /*
     * private  fire single object instance
     */
    _wireObjectInstance: function (object, definition, objectID) {


        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods(object, definition, objectID);

        this._injectFactoryObject(object, definition, objectID)

        //invoke init method
        this._invokeInitMethod(object, definition);

        definition.$isWired = true;
    },

    _createDelegate: function (fn, obj, args) {
        return function () {
            //var callArgs = args || arguments;

            return fn.apply(obj, args);
        };
    },

    _getMethodName: function (str) {

        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    reset: function () {

//        _.forEach(this._instances,function(value,key){
//            this._instances[key] = null;
//            delete this._instances[key];
//        },this);
//
//        _.forEach(this._definitions,function(value,key){
//            this._definitions[key] = null;
//            delete this._definitions[key];
//        },this);

        this._instances = {};

        this._definitions = {};

        this._options = {};

        this._factories.length = 0;
    }

});


module.exports.createContainer = function () {
    return new Injector();
}