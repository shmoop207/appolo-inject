"use strict";

import _ = require('lodash');
import    path = require('path');
import {IOptions} from "./IOptions";
import {IFactory} from "./IFactory";
import {IDefinition, IParamInject} from "./IDefinition";
import {Define} from "./define";

type keyObject = { [index: string]: Object }

export class Injector {

    private readonly FACTORY_POSTFIX = "Factory";

    private _definitions: { [index: string]: IDefinition };
    private _instances: keyObject;
    private _factories: { [index: string]: { [index: string]: string } };
    private _alias: { [index: string]: Object[] };
    private _aliasFactory: { [index: string]: Object[] };

    private _options: IOptions;

    constructor() {
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
    public initialize(options?: IOptions) {
        this._options = options || {};

        for (let key in this._options.definitions) {
            if (this._options.definitions.hasOwnProperty(key)) {
                this._definitions[key] = this._options.definitions[key]

            }
        }

        this._wireObjects();

        return this;
    }

    /*
     * public get object by object Id
     */
    public getObject<T>(objectID: string, runtimeArgs?: any[]): T {
        return this._get<T>(objectID, runtimeArgs)

    }

    public resolve<T>(objectID: string, runtimeArgs?: any[]): T {
        return this._get<T>(objectID, runtimeArgs)
    }


    public get<T>(objectID: string, runtimeArgs?: any[]): T {
        return this._get<T>(objectID, runtimeArgs)

    }

    private _get<T>(objectID: string, runtimeArgs?: any[], ignoreFactory?: boolean, referenceChain: any[] = []): T {
        //check if we have factory and it's not ignored
        if (this._definitions[(objectID + this.FACTORY_POSTFIX)] && !ignoreFactory) {
            return this.getObject<IFactory<T>>(objectID + this.FACTORY_POSTFIX).get();
        }

        let instance = this._instances[objectID] as T;

        if (!instance) {

            instance = this._createObjectInstance<T>(objectID, this._definitions[objectID], runtimeArgs, referenceChain);
        }

        return instance;
    }

    public getInstance<T>(objectId: string): T {
        return this._instances[objectId] as T;
    }

    public addDefinition(objectId: string, definition: IDefinition): Injector {
        if (this._definitions[objectId]) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }

        this._definitions[objectId] = definition;

        return this;
    }

    public removeDefinition(objectId: string): Injector {

        delete this._definitions[objectId];

        return this;
    }

    public addDefinitions(definitions: { [index: string]: any } | Map<string, any>): Injector {

        if (definitions instanceof Map) {
            definitions.forEach((value, key) => this.addDefinition(key, value))
        } else {
            for (let key in definitions) {
                if (definitions.hasOwnProperty(key)) {
                    this.addDefinition(key, definitions[key])

                }
            }
        }

        return this;

    }

    public addObject<T>(objectId: string, instance: T): Injector {

        return this.addInstance(objectId, instance);
    }

    public addInstance<T>(objectId: string, instance: T): Injector {

        if (this._instances[objectId]) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }

        this._instances[objectId] = instance;

        return this;
    }

    public removeInstance(objectId: string): Injector {

        delete this._instances[objectId];

        return this;
    }

    public getObjectsByType<T>(type: Function): T[] {

        let output = [];

        for (let key in this._instances) {
            if (this._instances.hasOwnProperty(key) && this._instances[key] instanceof type) {
                output.push(this._instances[key])
            }
        }

        return output;
    }

    public getInstances(): { [index: string]: { [index: string]: any } } {
        return this._instances;
    }

    public getDefinitions(): { [index: string]: IDefinition } {
        return this._definitions;
    }

    public getDefinition(id: string): IDefinition {
        return this._definitions[id];
    }

    public getAlias(aliasName: string): any[] {
        return this._alias[aliasName] || [];
    }

    public getAliasFactory(aliasName: string): any[] {
        return this._aliasFactory[aliasName] || [];
    }

    public delegate(objectId: string): Function {

        let self = this;

        return function () {
            let object = self.getObject<any>(objectId);

            object.run.apply(object, arguments);
        }
    }

    public define(id: string, type: Function): Define {

        return new Define(this, id, type)
    }


    public reset() {

        this._instances = {};

        this._definitions = {};

        this._options = {};

        this._alias = {};
        this._aliasFactory = {};

        this._factories = {};
    }

    private _createObjectInstance<T>(objectID: string, objectDefinition: IDefinition, runtimeArgs?: any[], referenceChain: any[] = []): T {
        let argumentInstances = [],
            args: IParamInject[],
            newObjectInstance;

        //check Circular reference
        if (referenceChain.indexOf(objectID) > -1) {
            referenceChain.push(objectID);
            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`)
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
            objectDefinition.type = require(path.join(this._options.root, objectDefinition.path + '.js'))
        }

        args = (objectDefinition.args && objectDefinition.args.length > 0) ? objectDefinition.args : [];

        //add runtime args to the end of args obj
        for (let i = 0, length = (runtimeArgs ? runtimeArgs.length : 0); i < length; i++) {
            args.push({value: runtimeArgs[i]});
        }

        //loop over args and get the arg value or create arg object instance
        for (let i = 0, length = (args ? args.length : 0); i < length; i++) {
            let arg = args[i];
            argumentInstances.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, [], false, referenceChain));
        }

        try {
            //crate object instance
            newObjectInstance = new (objectDefinition.type as any)(...argumentInstances);
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
    private _wireObjects() {

        //add aliasFactory

        for (let objectId in this._definitions) {

            if (this._definitions.hasOwnProperty(objectId)) {
                let definition = this._definitions[objectId];
                if (definition.aliasFactory) {
                    this._populateAliasFactory(definition, objectId)
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

    private _populateAliasFactory(definition: IDefinition, objectId: string) {

        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {

            let aliasName = definition.aliasFactory[i];

            let delegateFn = this._createDelegate(this.getObject, this, [objectId]);
            (delegateFn as any).type = definition.type;
            this._mapPush(this._aliasFactory, aliasName, delegateFn)
        }


    }

    /*
     * invoke the init method of given object
     */
    private _invokeInitMethod<T>(object: T, definition: IDefinition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
    }

    private _getProperties(objectDefinition: IDefinition): IParamInject[] {
        let properties = objectDefinition.props || objectDefinition.properties || [];

        if (!objectDefinition.$propertiesGenerated) {


            for (let i = 0, length = (objectDefinition.inject ? objectDefinition.inject.length : 0); i < length; i++) {
                let injectable = objectDefinition.inject[i];

                properties.push(_.isString(injectable) ? ({
                    name: injectable,
                    ref: injectable
                }) : injectable)


            }

            objectDefinition.properties = properties;

            objectDefinition.$propertiesGenerated = true;
        }

        return properties;
    }

    /*
     * private  fire single object instance
     */
    private _wireObjectInstance<T>(object: T, definition: IDefinition, objectId: string) {

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
    private _injectPropertiesAndLookUpMethods<T>(object: T, objectDefinition: IDefinition, objectId: string) {
        let injectObject,
            obj,
            factoryRef,
            properties = this._getProperties(objectDefinition);

        //loop over the properties definition

        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            //get property obj
            injectObject = null;
            factoryRef = prop.ref + this.FACTORY_POSTFIX;

            if (prop.array) {

                injectObject = _.map<IParamInject, any>(prop.array, (propObj: IParamInject) => propObj.value || this.getObject(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};

                _.forEach(prop.dictionary, (propObj: IParamInject) => injectObject[propObj.key] = propObj.value || this.getObject(propObj.ref));

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

                injectObject = this._createDelegate(this.getObject, this, [prop.factoryMethod])
            }

            if (injectObject) {
                object[prop.name] = injectObject;
            }
        }

        if (objectDefinition.injectorAware) {
            (object as any).$injector = this;
        }

        //add alias
        if (objectDefinition.alias && objectDefinition.singleton) {
            for (let key in objectDefinition.alias) {
                if (objectDefinition.alias.hasOwnProperty(key)) {
                    this._mapPush(this._alias, objectDefinition.alias[key], object)
                }
            }
        }
    }

    private _injectFactoryObject<T>(object: T, objectId: string) {

        let factoryData = this._factories[objectId];

        if (factoryData) {

            for (let propName in factoryData) {
                if (factoryData.hasOwnProperty(propName)) {
                    let factory = factoryData[propName];
                    object[propName] = this.getObject<IFactory<T>>(factory).get()
                }

            }
        }
    }

    private _injectAlias<T>(definition: IDefinition, instance: T) {
        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];

            (prop.alias) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAlias(prop.alias), prop.indexBy) : this.getAlias(prop.alias));
        }

    }

    private _injectAliasFactory<T>(definition: IDefinition, instance: T) {

        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            (prop.aliasFactory) && (instance[prop.name] = prop.indexBy ? _.keyBy(this.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy]) : this.getAliasFactory(prop.aliasFactory))
        }
    }

    private _createDelegate(fn: Function, obj: any, args: any[]): Function {
        return function () {

            let callArgs = (args || []).concat(arguments);

            return fn.apply(obj, callArgs);
        };
    }

    private _mapPush(map: { [index: string]: Object[] }, key: string, obj: Object): void {
        (!map[key]) && (map[key] = []);

        map[key].push(obj)
    }

    private _getFunctionArgs(func: Function): string[] {

        let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
            ARGUMENT_NAMES = /([^\s,]+)/g,
            fnStr = func.toString().replace(STRIP_COMMENTS, '').replace(/(\r\n|\n|\r|\t| )/gm, ""),
            args = fnStr.slice(fnStr.indexOf('constructor(') + 12, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];

        return _.compact(args);
    }


}

export let createContainer = function (): Injector {
    return new Injector();
};
