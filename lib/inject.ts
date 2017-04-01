"use strict";

import _ = require('lodash');
import    path = require('path');
import {IOptions} from "./IOptions";
import {IFactory} from "./IFactory";
import {IDefinition, IParamInject} from "./IDefinition";
import {Define} from "./define";


export class Injector {

    private readonly FACTORY_POSTFIX = "Factory";

    private _definitions: Map<string, IDefinition>;
    private _instances: Map<string, any>;
    private _factories: Map<string, any>;
    private _alias: Map<string, any>;
    private _aliasFactory: Map<string, any>;

    private _options: IOptions;

    constructor() {
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
    public initialize(options?: IOptions) {
        this._options = options || {};

        _.forEach(this._options.definitions, (value, key) => this._definitions.set(key, value));

        this._wireObjects();

        return this;
    }

    /*
     * public get object by object Id
     */
    public getObject<T>(objectID: string, runtimeArgs?: any[], ignoreFactory?: boolean): T {
        return this.get<T>(objectID, runtimeArgs, ignoreFactory)

    }

    public resolve<T>(objectID: string, runtimeArgs?: any[], ignoreFactory?: boolean): T {
        return this.get<T>(objectID, runtimeArgs, ignoreFactory)
    }


    public get<T>(objectID: string, runtimeArgs?: any[], ignoreFactory?: boolean): T {

        //check if we have factory and it's not ignored
        if (this._definitions.has(objectID + this.FACTORY_POSTFIX) && !ignoreFactory) {
            return this.getObject<IFactory<T>>(objectID + this.FACTORY_POSTFIX).get();
        }

        let instance = this._instances.get(objectID);

        if (!instance) {

            instance = this._createObjectInstance(objectID, this._definitions.get(objectID), runtimeArgs);
        }

        return instance;
    }

    public getInstance<T>(objectId: string): T {
        return this._instances.get(objectId);
    }

    public addDefinition(objectId: string, definition:IDefinition): Injector {
        if (this._definitions.has(objectId)) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }

        this._definitions.set(objectId, definition);

        return this;
    }

    public removeDefinition(objectId: string): Injector {

        this._definitions.delete(objectId);

        return this;
    }

    public addDefinitions(definitions): Injector {

        if (definitions instanceof Map) {
            definitions.forEach((value, key) => this.addDefinition(key, value))
        } else {
            _.forEach(definitions, (value, key) => this.addDefinition(key, value));
        }

        return this;

    }

    public addObject<T>(objectId: string, instance: T): Injector {

        return this.addInstance(objectId, instance);
    }

    public addInstance<T>(objectId: string, instance: T):Injector {

        if (this._instances.has(objectId)) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }

        this._instances.set(objectId, instance);

        return this;
    }

    public removeInstance(objectId: string): Injector {

        this._instances.delete(objectId);

        return this;
    }

    public getObjectsByType<T>(type:Function): T[] {

        return Array.from(this._instances.values()).filter(obj => obj instanceof type)
    }

    public getInstances(): Map<string, any> {
        return this._instances;
    }

    public getDefinitions():Map<string,IDefinition> {
        return this._definitions;
    }

    public getDefinition(id:string):IDefinition {
        return this._definitions.get(id);
    }

    public getAlias(aliasName:string):any[] {
        return this._alias.get(aliasName) || [];
    }

    public getAliasFactory(aliasName:string):any[] {
        return this._aliasFactory.get(aliasName) || [];
    }

    public delegate(objectId: string):Function {

        let self = this;

        return function () {
            let object = self.getObject<any>(objectId);

            object.run.apply(object, arguments);
        }
    }

    public define(id:string, type:Function):Define {

        return new Define(this, id, type)
    }


    public reset() {

        this._instances.clear();

        this._definitions.clear();

        this._options = {};

        this._alias.clear();
        this._aliasFactory.clear();

        this._factories.clear();
    }

    private _createObjectInstance<T>(objectID: string, objectDefinition:IDefinition, runtimeArgs?: any[], referenceChain: any[] = []):T {
        let argumentInstances = [],
            args:IParamInject[] = [],
            newObjectInstance;

        //check Circular reference
        if (_.includes(referenceChain, objectID)) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`)
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
                objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'))
            }

            args = ((objectDefinition.args && objectDefinition.args.length > 0)
                    ? objectDefinition.args
                    : _(this._getFunctionArgs(objectDefinition.type)).reject(arg => !this._definitions.has(arg)).map(arg => ({ref: arg})).value())
                || [];

            //add runtime args to the end of args obj
            _.forEach(runtimeArgs, arg => args.push({value: arg}));


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
    private _wireObjects() {

        //add aliasFactory
        this._definitions.forEach((definition:IDefinition, objectId:string) => {
            if (definition.aliasFactory) {
                this._populateAliasFactory(definition, objectId)
            }
        });


        this._definitions.forEach((definition:IDefinition, objectId:string) => {
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        });

        //loop over instances and inject properties and look up methods only if exist in def
        this._instances.forEach((instance, objectId) => {

            (this._definitions.has(objectId)) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions.get(objectId), objectId));
        });

        this._instances.forEach((instance:any, objectId:string) => {
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

    private _populateAliasFactory(definition:IDefinition, objectId:string) {
        _.forEach(definition.aliasFactory, aliasName => {
            let delegateFn = this._createDelegate(this.getObject, this, [objectId]);
            (delegateFn as any).type = definition.type;
            this._mapPush(this._aliasFactory, aliasName, delegateFn)
        })
    }

    /*
     * invoke the init method of given object
     */
    private _invokeInitMethod<T>(object:T, definition:IDefinition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
    }

    private _getProperties(objectDefinition:IDefinition):IParamInject[] {
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
    private _wireObjectInstance<T>(object:T, definition:IDefinition, objectId:string) {

        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods<T>(object, definition, objectId);

        this._injectFactoryObject<T>(object, objectId);

        this._injectAlias<T>(definition, object);

        this._injectAliasFactory<T>(definition, object);

        //invoke init method
        this._invokeInitMethod<T>(object, definition);

        definition.singleton && (definition.$isWired = true);
    }

    /*
     * private inject values and look up methods to object properties
     */
    private _injectPropertiesAndLookUpMethods<T>(object:T, objectDefinition:IDefinition, objectId:string) {
        let injectObject,
            obj,
            factoryRef,
            properties = this._getProperties(objectDefinition);

        //loop over the properties definition
        _.forEach(properties, (prop:IParamInject) => {

            //get property obj
            injectObject = null;
            factoryRef = prop.ref + this.FACTORY_POSTFIX;

            if (prop.array) {

                injectObject = _.map<IParamInject,any>(prop.array, (propObj:IParamInject) => propObj.value || this.getObject(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};

                _.forEach(prop.dictionary, (propObj:IParamInject) => injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref));

            }
            else if (prop.value) {

                injectObject = prop.value;

            }
            else if (prop.ref && !this._definitions.has(factoryRef)) { //check if we have ref and we don't have factory with the same name

                injectObject = this.getObject(prop.ref);

            }
            else if (prop.objectProperty) {
                obj = this.getObject(prop.objectProperty.object);

                injectObject = obj[prop.objectProperty.property];

            }
            else if (prop.factory || this._definitions.has(factoryRef)) {

                if (factoryRef == objectId) {  //check if we trying  to inject to factory with the same name

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

                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod])
            }

            if (injectObject) {
                object[prop.name] = injectObject;
            }
        });

        if (objectDefinition.injectorAware) {
            (object as any).$injector = this;
        }

        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            _.forEach(objectDefinition.alias, aliasName => this._mapPush(this._alias, aliasName, object))
        }
    }

    private _injectFactoryObject<T>(object:T, objectId:string) {

        let factoryData = this._factories.get(objectId);

        if (factoryData) {
            _.forEach(factoryData, (factory:string, propName:string) => object[propName] = this.getObject<IFactory<T>>(factory).get());
        }
    }

    private _injectAlias<T>(definition:IDefinition, instance:T) {

        _.forEach(definition.properties, (prop:IParamInject) => (prop.alias) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAlias(prop.alias), prop.indexBy) : this.getAlias(prop.alias)))
    }

    private _injectAliasFactory<T>(definition:IDefinition, instance:T) {

        _.forEach(definition.properties, prop => (prop.aliasFactory) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy]) : this.getAliasFactory(prop.aliasFactory)))
    }

    private _createDelegate(fn:Function, obj:any, args:any[]):Function {
        return function () {

            let callArgs = (args || []).concat(arguments);

            return fn.apply(obj, callArgs);
        };
    }

    private _mapPush(map, key, obj) {
        (!map.has(key)) && map.set(key, []);

        map.get(key).push(obj)
    }

    private _getFunctionArgs(func:Function):string[] {

        let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
            ARGUMENT_NAMES = /([^\s,]+)/g,
            fnStr = func.toString().replace(STRIP_COMMENTS, '').replace(/(\r\n|\n|\r|\t| )/gm, ""),
            args = fnStr.slice(fnStr.indexOf('constructor(') + 12, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];

        return _.compact(args);
    }


}

export let createContainer = function ():Injector {
    return new Injector();
};
