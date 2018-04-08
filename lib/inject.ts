"use strict";
import _ = require('lodash');
import {IOptions} from "./IOptions";
import {IFactory} from "./IFactory";
import {IDefinition, IParamInject} from "./IDefinition";
import {Define} from "./define";
import {InjectDefineSymbol, InjectParamSymbol} from "./decorators";
import {Util} from "./util";

type keyObject = { [index: string]: Object }

export class Injector {

    private readonly FACTORY_POSTFIX = "Factory";

    private _definitions: { [index: string]: IDefinition };
    private _instances: keyObject;
    private _factoriesObjects: { [index: string]: { [index: string]: string } };
    private _factoriesValues: { [index: string]: any };
    private _alias: { [index: string]: Object[] };
    private _aliasFactory: { [index: string]: Object[] };

    private _factories: string[];

    private _parent: Injector;

    private _options: IOptions;

    constructor() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factoriesObjects = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesValues = {};
        this._factories = [];
    }

    public get parent(): Injector {
        return this._parent
    }

    public set parent(value: Injector) {
        this._parent = value;
    }

    public async initialize(options?: IOptions) {
        this._options = options || {};

        let keys = Object.keys(this._options.definitions || {});
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            this._definitions[key] = this._options.definitions[key];
        }


        await  this._wireObjects();
    }

    private async _wireObjects() {

        let keys = Object.keys(this._definitions);

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], definition = this._definitions[objectId];

            this._initInjectParams(definition);

            this._initProperties(definition);

            if (definition.factory) {
                this._factories.push(definition.id);
            }

            if (definition.aliasFactory) {
                this._populateAliasFactory(definition, objectId)
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

        await this._loadFactories(this._factories);

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];

            if (this._definitions[objectId]) {
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(this._definitions[objectId], instance);
                this._injectAliasFactory(this._definitions[objectId], instance);
            }
        }

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
        }
    }

    private _initInjectParams(def: IDefinition) {

        let $self = this;

        if (!def.type) {
            return
        }
        let params = Reflect.getMetadata(InjectParamSymbol, def.type);

        if (!params || !_.isFunction(def.type)) {
            return
        }

        let paramGroups = _.groupBy(params, "method");

        _.forEach(paramGroups, (items: any[], method: string) => {
            let oldFn = def.type.prototype[method];
            oldFn = oldFn.originFn || oldFn;

            def.type.prototype[method] = function (...args: any[]) {
                for (let i = 0, length = (items.length || 0); i < length; i++) {
                    args[items[i].index] = $self.getObject(items[i].param)
                }

                return oldFn.apply(this, args)
            };
            def.type.prototype[method].originFn = oldFn;

        });
    }

    public getObject<T>(objectID: string | Function, runtimeArgs?: any[]): T {

        return this.get<T>(objectID, runtimeArgs)
    }

    public resolve<T>(objectID: string | Function, runtimeArgs?: any[]): T {

        return this.get<T>(objectID, runtimeArgs)
    }

    public get<T>(objectID: string | Function, runtimeArgs?: any[]): T {

        objectID = Util.getClassNameOrId(objectID)

        return this._get<T>(objectID as string, runtimeArgs)
    }

    public getFactoryValue<T>(objectID: string): T {
        let def = this._definitions[objectID as string]

        if (!def) {
            return this.parent ? this.parent.getFactoryValue<T>(objectID) : null;
        }

        if (def.injector) {
            return def.injector.getFactoryValue<T>(def.id);
        }

        return this._factoriesValues[def.id];
    }

    public async getFactory<T>(objectID: string | Function): Promise<T> {

        objectID = Util.getClassNameOrId(objectID);

        let def = this._definitions[objectID as string] || this._definitions[objectID + this.FACTORY_POSTFIX];

        if (!def) {
            return this.parent ? this.parent.getFactory<T>(objectID) : null;
        }

        if (def.injector) {
            return def.injector.getFactory<T>(def.id);
        }

        let value = this._factoriesValues[def.id];

        if (value) {
            return value;
        }

        let factory = this._get<IFactory<T>>(def.id);

        this._injectFactoryObject(this._instances[def.id], def.id);

        value = await factory.get();

        this._factoriesValues[def.id] = value;

        return value;
    }

    private _get<T>(objectID: string, runtimeArgs?: any[], referenceChain: any[] = []): T {

        let instance = this._instances[objectID] as T;

        if (instance) {
            return instance;
        }

        let definition = this._definitions[objectID];

        if (definition) {
            return definition.injector
                ? definition.injector.getObject(objectID, runtimeArgs)
                : this._createObjectInstance<T>(objectID, this._definitions[objectID], runtimeArgs, referenceChain);
        }

        if (this.parent) {
            return this.parent.getObject(objectID);
        }

        throw new Error(`Injector:can't find object definition for objectID:${objectID} ${referenceChain.join(' -> ')}}`);
    }

    public getInstance<T>(objectId: string): T {
        return this._instances[objectId] as T;
    }

    public addDefinition(objectId: string, definition: IDefinition): Injector {
        if (this._definitions[objectId]) {
            console.log(`Injector:definition id already exists overriding:  ${objectId}`);
        }
        definition.id = objectId;

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

    public addObject<T>(objectId: string, instance: T, silent?: boolean): Injector {

        return this.addInstance(objectId, instance, silent);
    }

    public addInstance<T>(objectId: string, instance: T, silent?: boolean): Injector {

        if (!silent && this._instances[objectId]) {
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
        let def = this._definitions[id];

        if (def) {
            return def.injector ? def.injector.getDefinition(id) : def;
        }

        if (this.parent) {
            return this.parent.getDefinition(id);
        }
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
            let object = self._get<any>(objectId);

            object.run.apply(object, arguments);
        }
    }

    public registerMulti(fns: Function[]): this {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }

        return this;
    }

    public register(id: string | Function, type?: Function): Define {

        if (_.isFunction(id)) {
            type = id;
            id = Util.getClassName(type);
        }

        let define = type
            ? (Reflect.getMetadata(InjectDefineSymbol, type) || new Define(id as string, type))
            : new Define(id as string);

        this.addDefinition(id as string, define.definition);

        return define;
    }

    private _createObjectInstance<T>(objectID: string, objectDefinition: IDefinition, runtimeArgs?: any[], referenceChain: any[] = []): T {
        let argumentInstances = runtimeArgs || [],
            args: IParamInject[],
            newObjectInstance;

        if (referenceChain.length && referenceChain.indexOf(objectID) > -1) {
            referenceChain.push(objectID);

            throw new Error(`Circular reference ${referenceChain.join(' -> ')}`)
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
            argumentInstances = [...args,...argumentInstances]
        }

        try {
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

    private _populateAliasFactory(definition: IDefinition, objectId: string) {

        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {

            let aliasName = definition.aliasFactory[i];

            let delegateFn = Util.createDelegate(this._get, this, [objectId]);
            (delegateFn as any).type = definition.type;
            Util.mapPush(this._aliasFactory, aliasName, delegateFn)
        }
    }

    private _invokeInitMethod<T>(object: T, definition: IDefinition) {
        if (definition.initMethod && !definition.$isWired) {
            object[definition.initMethod]();
        }
    }

    private _initProperties(definition: IDefinition): void {

        let properties = definition.props || definition.properties || [];


        for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
            let injectable = definition.inject[i];

            let dto = injectable;

            if (_.isString(injectable)) {

                dto = {
                    name: injectable,
                    ref: injectable
                }
            }

            if (dto.ref) {
                let factoryRef = dto.ref + this.FACTORY_POSTFIX,
                    factoryDef = this.getDefinition(factoryRef),
                    refDef = this.getDefinition(dto.ref);

                if (refDef && refDef.factory) {
                    dto.factory = refDef.id;
                    delete dto.ref
                }

                else if (factoryDef && factoryDef.factory && definition.id != factoryRef) {
                    dto.factory = factoryRef;
                    delete dto.ref
                }
            }

            properties.push(dto)
        }

        definition.properties = properties;
    }

    private _wireObjectInstance<T>(object: T, definition: IDefinition, objectId: string) {

        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods<T>(object, definition, objectId);

        this._injectFactoryObject<T>(object, objectId);

        this._injectAlias<T>(definition, object);

        this._injectAliasFactory<T>(definition, object);

        this._invokeInitMethod<T>(object, definition);

        definition.singleton && (definition.$isWired = true);
    }

    private _injectPropertiesAndLookUpMethods<T>(object: T, objectDefinition: IDefinition, objectId: string) {
        let injectObject,
            obj, properties = objectDefinition.properties;

        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            injectObject = null;
            if (prop.array) {

                injectObject = _.map<IParamInject, any>(prop.array, (propObj: IParamInject) => propObj.value || this._get(propObj.ref));
            }
            else if (prop.dictionary) {
                injectObject = {};

                _.forEach(prop.dictionary, (propObj: IParamInject) => injectObject[propObj.key] = propObj.value || this._get(propObj.ref));

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

                injectObject = Util.createDelegate(this._get, this, [prop.factoryMethod])
            }

            if (injectObject) {
                object[prop.name] = injectObject;
            }
        }

        if (objectDefinition.injectorAware) {
            (object as any).$injector = this;
        }

        if (objectDefinition.alias && objectDefinition.singleton) {

            let keys = Object.keys(objectDefinition.alias);

            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                Util.mapPush(this._alias, objectDefinition.alias[key], object)
            }
        }
    }

    private async _loadFactories(factories: string[]) {
        for (let factory of factories) {
            await this.loadFactory(factory);
        }
    }

    private async loadFactory<T>(objectId: string) {
        let factoryData = this._factoriesObjects[objectId];


        let keys = Object.keys(factoryData || {});
        for (let propName of keys) {
            let factory = factoryData[propName];

            await this.loadFactory(factory);
        }

        this._factoriesValues[objectId] = await this.getFactory(objectId);
    }

    private _injectFactoryObject<T>(object: T, objectId: string) {

        let factoryData = this._factoriesObjects[objectId];

        if (!factoryData) {
            return;
        }

        let keys = Object.keys(factoryData);

        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i], factory = factoryData[propName];

            object[propName] = this.getFactoryValue(factory);
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

    public reset() {

        this._instances = {};

        this._definitions = {};

        this._options = {};

        this._alias = {};
        this._aliasFactory = {};

        this._factoriesObjects = {};
    }
}

export let createContainer = function (): Injector {
    return new Injector();
};
