"use strict";

var _ = require('lodash'),
    path = require('path'),
    Class = require('appolo-class');


var Injector = Class.define({

    constructor: function () {
        this._instances = [];
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
            this._definitions[key] = value;
        }.bind(this));

    },

    addObject: function (objectId, instance) {
        if (!this._instances[objectId]) {
            this._instances[objectId] = instance;
        } else {
            throw new Error("SpringJS:object id already exists:" + objectId);
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
            throw new Error("SpringJS:cant find object definition for objectID:" + objectID);
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


//                if (objectDefinition.path) {
//                    var rootPath = path.join(this._options.root, objectDefinition.path + '.js');
//
//                    Func = (fs.existsSync(rootPath)) ? require(rootPath) : require(objectDefinition.path);
//
//                    if (objectDefinition.type) {
//                        Func = Func[objectDefinition.type];
//
//                    }
//
//                    eval("newObjectInstance = new Func (" + commands.join(",") + ")");
//                } else {
//                    eval("newObjectInstance = new " + objectDefinition.type + " (" + commands.join(",") + ")");
//                }


                //newObjectInstance = new Func(eval(commands.join(",")));

            } catch (e) {
                throw new Error("SpringJS can't find object type for objectID:" + objectID + "' \n" + e);
            }

            //if its not singleton wire the object else store it in the hash array
            if (!objectDefinition.singleton) {
                this._wireObjectInstance(newObjectInstance, objectDefinition);
            } else {
                this._instances[objectID] = newObjectInstance;

            }
        }

        return newObjectInstance;
    },


    /*
     * private creates new objects instances and inject properties
     */
    _wireObjects: function (definitions) {
        var objectID;
        //loop over definition and create all singletons objects
        for (objectID in definitions) {
            if (definitions.hasOwnProperty(objectID)) {
                if (definitions[objectID].singleton && !definitions[objectID].lazy) {
                    this._createObjectInstance(objectID, definitions[objectID]);
                }
            }
        }

        //loop over instances and inject properties and look up methods
        for (objectID in this._instances) {
            if (this._instances.hasOwnProperty(objectID)) {
                //check if we have a definition
                if (definitions[objectID]) {
                    this._injectPropertiesAndLookUpMethods(this._instances[objectID], definitions[objectID]);
                }
            }
        }

        //inject factory
        _.forEach(this._factories,function(factoryObj){
            var factory = this.getObject(factoryObj.factory);

            factoryObj.object[factoryObj.name] = factory.get();

        },this);

        //loop instances and invoke init methods
        for (objectID in this._instances) {
            if (this._instances.hasOwnProperty(objectID)) {
                //check if we have a definition
                if (definitions[objectID]) {
                    this._invokeInitMethod(this._instances[objectID], definitions[objectID]);
                }
            }
        }


    },

    /*
     * invoke the init method of given object
     */
    _invokeInitMethod: function (object, definition) {
        if (definition.initMethod) {
            object[definition.initMethod]();
        }
    },

    /*
     * private inject values and look up methods to object properties
     */
    _injectPropertiesAndLookUpMethods: function (object, objectDefinition) {
        var prop,
            i = 0,
            j = 0,
            length,
            propObj,
            injectObject,
            obj,
            methodToInvoke;

        if (!objectDefinition.props) {
            objectDefinition.props = []
        }


        if (objectDefinition.inject) {
            for (var i = 0, length = objectDefinition.inject.length; i < length; i++) {
                objectDefinition.props.push({
                    name: objectDefinition.inject[i],
                    ref: objectDefinition.inject[i]
                });
            }
        }


        //loop over the properties definition
        for (i = 0; i < objectDefinition.props.length; i++) {
            //get property obj
            prop = objectDefinition.props[i];
            injectObject = null;

            if (prop.array) {
                injectObject = [];

                for (j = 0; j < prop.array.length; j++) {
                    propObj = prop.array[j];
                    injectObject.push(propObj.value || this.getObject(propObj.ref));
                }
            } else if (prop.dictionray) {
                injectObject = [];

                for (j = 0; j < prop.dictionray.length; j++) {
                    propObj = prop.dictionray[j];
                    injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref);
                }
            } else if (prop.value) {

                injectObject = prop.value;

            } else if (prop.ref && !this._definitions[prop.ref+"Factory"]) {
                injectObject =  this.getObject(prop.ref);

            } else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);

                injectObject = obj[prop.objectProperty.property];

            } else if (prop.factory || this._definitions[prop.ref+"Factory"]) {

                this._factories.push({
                    object:object,
                    name:prop.name,
                    factory:prop.factory || prop.ref+"Factory"
                });

            } else if (prop.factoryMethod) {

                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod])
            }

            if(injectObject){
                object[prop.name] = injectObject;
            }




//                //get method name in java style
//                methodToInvoke = 'set' + this._getMethodName(prop.name);
//
//                //try to invoke the set method if  not found inject the property value
//                if (object[methodToInvoke]) {
//                    object[methodToInvoke](injectObject);
//                } else {
//                    object[prop.name] = injectObject;
//                }

        }

//        //check if we need to inject look up method
//        if (objectDefinition.lookUpMethod) {
//            //loop over look up methods array
//            for (i = 0, length = objectDefinition.lookUpMethod.length; i < length; i++) {
//
//                object[objectDefinition.lookUpMethod[i].name] = ;
//            }
//        }

        if (objectDefinition.contextAware) {
            object.springJSContext = this;
        }

    },

    /*
     * private  fire single object instance
     */
    _wireObjectInstance: function (object, definition) {


        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods(object, definition);

        //invoke init method
        this._invokeInitMethod(object, definition);
    },

    _createDelegate: function (fn, obj, args) {
        return function () {
            //var callArgs = args || arguments;

            return fn.apply(obj, args);
        };
    },

    _getMethodName: function (str) {

        return str.charAt(0).toUpperCase() + str.slice(1);
    }

});


module.exports.createContainer = function () {
    return new Injector();
}