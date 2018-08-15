"use strict";
import _ = require('lodash');
import {IOptions} from "./IOptions";
import {IFactory} from "./IFactory";
import {Class, IDefinition, IParamInject} from "./IDefinition";
import {Define} from "./define";
import {InjectDefineSymbol, InjectParamSymbol} from "./decorators";
import {Util} from "./util";

type keyObject = { [index: string]: Object }

export class Injector {

    private _definitions: { [index: string]: IDefinition };
    private _instances: keyObject;
    private _factoriesObjects: { [index: string]: { [index: string]: { id: string, injector?: Injector } } };
    private _factoriesValues: { [index: string]: any };
    private _alias: { [index: string]: Object[] };
    private _aliasFactory: { [index: string]: Object[] };

    private _factories: string[];

    private _parent: Injector;
    private _children: Injector[];

    private _options: IOptions;

    private _isInitialized: boolean = false;

    constructor() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factoriesObjects = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesValues = {};
        this._factories = [];
        this._children = []
    }

    public get parent(): Injector {
        return this._parent
    }

    public set parent(value: Injector) {

        this._parent = value;

        value.children.push(this);
    }

    public get children(): Injector[] {
        return this._children;
    }

    public async initialize(options?: IOptions) {
        if (this._isInitialized) {
            return;
        }
        this._options = options || {};

        _.forEach(this._options.definitions, (def, id) => this.addDefinition(id, def));

        //we have parent so we wait until parent.initialize
        if (this.parent && !this._options.immediate) {
            return;
        }

        this.initDefinitions();

        this.initInstances();

        this.initProperties();

        await this.initFactories();

        this.initAlias();

        this.initInitMethods();

        this._isInitialized = true;
    }


    protected initDefinitions() {
        if (this._isInitialized) {
            return;
        }

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
                this._populateAliasFactory(definition, objectId)
            }
        }
    }

    protected initInstances() {
        if (this._isInitialized) {
            return;
        }

        _.forEach(this.children, injector => injector.initInstances());

        let keys = Object.keys(this._definitions);

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], definition = this._definitions[objectId];
            (definition.singleton && !definition.lazy) && (this._createObjectInstance(objectId, definition));
        }
    }

    protected initProperties() {
        if (this._isInitialized) {
            return;
        }
        _.forEach(this.children, injector => injector.initProperties());

        let keys = Object.keys(this._instances);

        //loop over instances and inject properties and look up methods only if exist in def
        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];

            (this._definitions[objectId]) && (this._injectPropertiesAndLookUpMethods(instance, this._definitions[objectId], objectId));
        }

    }

    protected async initFactories() {
        if (this._isInitialized) {
            return;
        }

        for (let injector of this.children) {
            await injector.initFactories()
        }

        for (let factory of this._factories) {
            await this.loadFactory(factory);
        }
    }

    protected initAlias() {

        if (this._isInitialized) {
            return;
        }

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

    protected initInitMethods() {

        if (this._isInitialized) {
            return;
        }

        let keys = Object.keys(this._instances);

        _.forEach(this.children, injector => injector.initInitMethods());

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];
            (this._definitions[objectId]) && (this._invokeInitMethod(instance, this._definitions[objectId]));
        }

        this._isInitialized = true;
    }

    private _prepareInjectParams(def: IDefinition) {

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

        objectID = Util.getClassNameOrId(objectID);

        let def = this._definitions[objectID];

        if (def && def.factory) {
            return this.getFactoryValue(objectID, def);
        }

        return this._get<T>(objectID as string, runtimeArgs)
    }

    public getFactoryValue<T>(objectID: string, definitions?: IDefinition): T {
        let def = definitions || this._definitions[objectID];

        if (!def) {
            return this.parent ? this.parent.getFactoryValue<T>(objectID) : null;
        }

        if (def.injector) {
            return def.injector.getFactoryValue<T>(def.refName || def.id);
        }

        return this._factoriesValues[def.id];
    }

    public async getFactory<T>(objectID: string | Function): Promise<T> {

        objectID = Util.getClassNameOrId(objectID);

        let def = this._definitions[objectID as string];

        if (!def) {
            return this.parent ? this.parent.getFactory<T>(objectID) : null;
        }

        if (def.injector) {
            return def.injector.getFactory<T>(def.refName || def.id);
        }

        let value = this._factoriesValues[def.id];

        if (value) {
            return value;
        }

        let factory = this._get<IFactory<T>>(def.id);

        this._injectFactoryObject(this._instances[def.id], def.id);
        this._injectAlias(def, this._instances[def.id]);
        this._injectAliasFactory(def, this._instances[def.id]);
        this._invokeInitMethod(this._instances[def.id], def);

        value = await factory.get();

        this._factoriesValues[def.id] = value;

        return value;
    }

    private _get<T>(objectID: string, runtimeArgs?: any[]): T {

        let instance = this._instances[objectID] as T;

        if (instance) {
            return instance;
        }

        let def = this._definitions[objectID];

        if (def) {
            return def.injector
                ? def.injector.getObject(def.refName || objectID, runtimeArgs)
                : this._createObjectInstance<T>(objectID, this._definitions[objectID], runtimeArgs);
        }

        if (this.parent) {
            return this.parent.getObject(objectID, runtimeArgs);
        }

        throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
    }

    public getInstance<T>(objectId: string): T {
        return this._instances[objectId] as T;
    }

    public addDefinition(objectId: string, definition: IDefinition): Injector {

        //we have definition and is already override mode so we do nothing
        if (this._definitions[objectId] && this._definitions[objectId].override && !definition.override) {
            return this;
        }

        //we have definition and the new definition is not in override mode so we throw error
        if (this._definitions[objectId] && !definition.override) {
            throw new Error(`Injector:definition id ${objectId} already exists use override decorator`);
        }

        definition = _.defaults(definition, {id: objectId, args: [], inject: [], alias: [], aliasFactory: []});

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
            return def.injector ? def.injector.getDefinition(def.refName || id) : def;
        }

        if (this.parent) {
            return this.parent.getDefinition(id);
        }
    }

    public getAlias(aliasName: string): any[] {
        return this._alias[aliasName] || (this.parent ? this.parent.getAlias(aliasName) : []) || [];
    }

    public getAliasFactory(aliasName: string): any[] {
        return this._aliasFactory[aliasName] || (this.parent ? this.parent.getAliasFactory(aliasName) : []) || [];
    }

    public delegate(objectId: string): Function {

        let self = this;

        return function () {
            let object = self._get<any>(objectId);

            object.run.apply(object, arguments);
        }
    }

    public registerMulti(fns: Class[]): this {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }

        return this;
    }

    public register(id: string | Class, type?: Class, filePath?: string): Define {

        if (_.isFunction(id)) {
            type = id as Class;
            id = Util.getClassName(type);
        }

        let define = type
            ? (Reflect.getMetadata(InjectDefineSymbol, type) || new Define(id as string, type))
            : new Define(id as string);

        define.path(filePath);

        this.addDefinition(define.definition.id || id, define.definition);

        return define;
    }

    private _createObjectInstance<T>(objectID: string, def: IDefinition, runtimeArgs?: any[]): T {
        let args = runtimeArgs || [], instance;

        if (!def) {
            throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
        }

        instance = this._instances[objectID];

        if (instance) {
            return instance;
        }

        //loop over args and get the arg value or create arg object instance
        if (def.args.length) {
            let defArgs = [];
            for (let i = 0, length = def.args.length; i < length; i++) {
                let arg = def.args[i];
                defArgs.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, []));
            }
            args = [...defArgs, ...args]
        }

        try {
            instance = args.length ? new (def.type as any)(...args) : new (def.type as any)();
        }
        catch (e) {
            throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
        }

        if (def.singleton && def.lazy) {

            this._wireObjectInstance(instance, def, objectID);
            this._instances[objectID] = instance;
        }
        else if (def.singleton) {

            this._instances[objectID] = instance;
        }
        else {

            this._wireObjectInstance(instance, def, objectID);
        }

        return instance;
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

    private _prepareProperties(definition: IDefinition): void {

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
                let refDef = this.getDefinition(dto.ref),
                    localDef = this._definitions[dto.ref],
                    localInjectorDef = localDef && localDef.injector && (localDef.injector.getDefinition(localDef.refName || localDef.id)),
                    factory;

                if (localInjectorDef && localInjectorDef.factory) {
                    //try to get local def factory from child injector
                    factory = {id: localDef.refName || localDef.id, injector: localDef.injector};

                } else if (refDef && refDef.factory) {
                    factory = {id: refDef.id};
                }


                //wohoo we found a factory update the property
                if (factory) {
                    dto.factory = factory;
                    delete dto.ref;
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


    private async loadFactory<T>(objectId: string) {
        let factoryData = this._factoriesObjects[objectId];


        let keys = Object.keys(factoryData || {});
        for (let propName of keys) {
            let factory = factoryData[propName];

            await this.loadFactory(factory.id);
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

            object[propName] = factory.injector ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
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
