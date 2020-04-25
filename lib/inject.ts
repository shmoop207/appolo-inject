"use strict";
import {IOptions} from "./IOptions";
import {IFactory} from "./IFactory";
import {Class, IDefinition, IParamInject} from "./IDefinition";
import {Define} from "./define";
import {InjectDefineSymbol, InjectParamSymbol} from "./decorators";
import {Util} from "./util";

type keyObject = { [index: string]: Object }

const IsWiredSymbol = "@__isWired__";

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

    public get options(): IOptions {
        return this._options
    }

    public get children(): Injector[] {
        return this._children;
    }

    public async initialize(options?: IOptions) {
        if (this._isInitialized) {
            return;
        }
        this._options = options || {};

        let definitions = {};

        Object.keys(definitions || {}).forEach(id => this.addDefinition(id, definitions[id]));

        //we have parent so we wait until parent.initialize
        if (this.parent && !this._options.immediate) {
            return;
        }

        this.initDefinitions();

        this.initInstances();


        await this.initFactories();

        this.initProperties();


        this.initAlias();

        await this.initInitMethods();

        this._isInitialized = true;
    }


    protected initDefinitions() {
        if (this._isInitialized) {
            return;
        }

        this.children.forEach(injector => injector.initDefinitions());


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

        this.children.forEach(injector => injector.initInstances());

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
        this.children.forEach(injector => injector.initProperties());

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

        await Util.runRegroupByParallel<Injector>(this.children, inject => inject.options.parallel, injector => injector.initFactories());

        for (let factory of this._factories) {
            await this.loadFactory(factory);
        }
    }

    protected initAlias() {

        if (this._isInitialized) {
            return;
        }

        let keys = Object.keys(this._instances);

        this.children.forEach(injector => injector.initAlias());


        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];

            let def = this._definitions[objectId];

            if (def) {
                this._injectFactoryObject(instance, objectId);
                this._injectAlias(def, instance);
                this._injectAliasFactory(def, instance);
            }
        }

    }

    protected async initInitMethods() {

        if (this._isInitialized) {
            return;
        }

        let keys = Object.keys(this._instances);

        await Promise.all(this.children.map(injector => injector.initInitMethods()));

        let asyncInitPromises = [];

        for (let i = 0, len = keys.length; i < len; i++) {
            let objectId = keys[i], instance = this._instances[objectId];

            let def = this._definitions[objectId];
            if (def) {
                def.initMethod && (this._invokeInitMethod(instance, this._definitions[objectId]));
                def.initMethodAsync && asyncInitPromises.push(instance[def.initMethodAsync]())
            }
        }

        if (asyncInitPromises.length) {
            await Promise.all(asyncInitPromises);
        }

        this._isInitialized = true;
    }


    private _prepareInjectParams(def: IDefinition) {

        let $self = this;

        if (!def.type) {
            return
        }
        let params = Reflect.getMetadata(InjectParamSymbol, def.type);

        if (!params || !Util.isFunction(def.type)) {
            return
        }

        let paramGroups = Util.groupByArray(params, "method");

        Object.keys(paramGroups).forEach(method => {
            let items: any[] = paramGroups[method];
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

        try {
            return this.get<T>(objectID, runtimeArgs)

        } catch (e) {
            return null;
        }
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

    public async getFactory<T>(objectID: string | Function, refs?: { ids: {}, paths: string[] }): Promise<T> {

        if (!refs) {
            refs = {ids: {}, paths: []}
        }

        objectID = Util.getClassNameOrId(objectID);

        let def = this._definitions[objectID as string];

        if (!def) {
            return this.parent ? this.parent.getFactory<T>(objectID, refs) : null;
        }

        if (def.injector) {
            return def.injector.getFactory<T>(def.refName || def.id, refs);
        }

        if (refs.ids[objectID]) {
            throw new Error(`Factory circular reference ${refs.paths.concat(objectID).join("-->")}`)
        }

        refs.paths.push(objectID);
        refs.ids[objectID] = true;

        let value = this._factoriesValues[def.id];

        if (value) {
            return value;
        }


        await this._loadFactoryInject(def, refs);


        let factory = this._get<IFactory<T>>(def.id);

        this._wireObjectInstance(factory, def, def.id);

        if (def.factory) {
            value = await factory.get();

            this._factoriesValues[def.id] = value;

            this._addSingletonAliases(def, value, false);

            return value;
        }

    }

    private async _loadFactoryInject(def: IDefinition, refs?: { ids: {}, paths: string[] }) {
        for (let inject of def.inject) {
            let id = inject.ref || (inject.factory ? inject.factory.id : null);

            if (id) {
                await this.getFactory(id, JSON.parse(JSON.stringify(refs)))
            }
            if (inject.alias) {
                let ids = this.getAliasDefinitions(inject.alias).map((def => def.id));
                for (let id of ids) {
                    await this.getFactory(id, JSON.parse(JSON.stringify(refs)))
                }
            }
        }
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

    public getInstance<T>(id: string): T {

        let instance = this._instances[id];

        if (instance) {
            return instance as T;
        }

        if (this.parent) {
            return this.parent.getInstance(id);
        }

        return null
    }

    public hasInstance(id: string) {
        return !!this.getInstance(id)
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

        let cloned = Object.assign({}, {id: objectId, args: [], inject: [], alias: [], aliasFactory: []}, definition);

        Object.assign(definition, cloned);

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

    public getDefinitionsValue(): IDefinition[] {
        return Object.values(this._definitions);
    }

    public getAliasDefinitions(alias: string): IDefinition[] {
        return Object.values(this._definitions).filter(item => (item.alias || []).includes(alias))
    }

    public getTypes(): Function[] {
        return this.getDefinitionsValue().map(item => item.type)
    }

    public hasDefinition(id: string): boolean {
        return !!this.getDefinition(id);
    }


    public getDefinition(id: string): IDefinition {
        let def = this.getOwnDefinition(id);

        if (def) {
            return def
        }

        if (this.parent) {
            return this.parent.getDefinition(id);
        }
    }

    public hasOwnDefinition(id: string): boolean {
        return !!this.getOwnDefinition(id);
    }

    public getOwnDefinition(id: string): IDefinition {
        let def = this._definitions[id];

        if (def) {
            return def.injector ? def.injector.getDefinition(def.refName || id) : def;
        }
    }

    public addAlias(aliasName: string, value: any) {
        this.getAlias(aliasName).push(value)
    }

    public removeAlias(aliasName: string, value: any) {
        Util.removeFromArray(this.getAlias(aliasName), value)
    }

    public getAlias(aliasName: string): any[] {
        return this._alias[aliasName] = this._alias[aliasName] || (this.parent ? this.parent.getAlias(aliasName) : []) || [];
    }

    public addAliasFactory(aliasName: string, value: any) {
        this.getAliasFactory(aliasName).push(value);
    }

    public removeAliasFactory(aliasName: string, value: any) {
        Util.removeFromArray(this.getAliasFactory(aliasName), value);
    }

    public getAliasFactory(aliasName: string): any[] {
        return this._aliasFactory[aliasName] = this._aliasFactory[aliasName] || (this.parent ? this.parent.getAliasFactory(aliasName) : []) || [];
    }

    public getFactoryMethod(objectId: string | Function): Function {

        return Util.createDelegate(this.get, this, [objectId]);
    }

    public registerMulti(fns: Class[]): this {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }

        return this;
    }

    public register(id: string | Class, type?: Class, filePath?: string): Define {

        if (Util.isFunction(id)) {
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

        if (def.lazyFn) {
            return def.lazyFn(this)
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
        } catch (e) {
            throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
        }

        if (def.singleton && def.lazy) {

            this._addSingletonAliases(def, instance);
            this._wireObjectInstance(instance, def, objectID);
            this._instances[objectID] = instance;
        } else if (def.singleton) {
            this._addSingletonAliases(def, instance);
            this._instances[objectID] = instance;
        } else {

            this._wireObjectInstance(instance, def, objectID);
        }

        if (def.injectorAware) {
            (instance as any).$injector = this;
        }

        return instance;
    }

    private _addSingletonAliases(def: IDefinition, instance: Object, checkFactory: boolean = true) {
        if (def.alias && def.alias.length && (!checkFactory || !def.factory)) {

            let keys = Object.keys(def.alias);

            for (let i = 0, len = keys.length; i < len; i++) {
                let key = keys[i];
                Util.mapPush(this._alias, def.alias[key], instance)
            }
        }
    }

    private _populateAliasFactory(definition: IDefinition, objectId: string) {

        for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {

            let aliasName = definition.aliasFactory[i];

            let delegateFn = Util.createDelegate(this._createFactoryMethod, this, [objectId, this]);
            (delegateFn as any).type = definition.type;
            Util.mapPush(this._aliasFactory, aliasName, delegateFn)
        }
    }

    private _createFactoryMethod(objectId: string, injector: Injector, runtimeArgs?: any[]) {

        let instance = injector._get(objectId, runtimeArgs);
        let def = injector.getDefinition(objectId);
        return def.dynamicFactory ? (instance as IFactory<any>).get() : instance
    }

    private _invokeInitMethod<T>(instance: T, definition: IDefinition) {

        if (instance[IsWiredSymbol]) {
            return
        }

        if (definition.initMethod) {
            instance[definition.initMethod]();
        }

        instance[IsWiredSymbol] = true;
    }

    private _prepareProperties(definition: IDefinition): void {

        let properties = definition.props || definition.properties || [];


        for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
            let injectable = definition.inject[i];

            let dto = injectable;

            if (Util.isString(injectable)) {

                dto = {
                    name: injectable as string,
                    ref: injectable as string
                }
            }

            if (dto.parent && dto.parent !== definition.type) {
                dto.injector = this._children.find(injector => !!injector.getDefinitionsValue().find(def => def.type === dto.parent))
            }

            let injector = dto.injector || this;

            if (dto.ref) {
                let refDef = injector.getDefinition(dto.ref),
                    localDef = this._definitions[dto.ref],
                    localInjectorDef = localDef && localDef.injector && (localDef.injector.getDefinition(localDef.refName || localDef.id)),
                    factory;

                if (localInjectorDef && localInjectorDef.factory) {
                    //try to get local def factory from child injector
                    factory = {id: localDef.refName || localDef.id, injector: localDef.injector};

                } else if (refDef && refDef.factory) {
                    factory = {id: refDef.id, injector: dto.injector};
                }

                //wohoo we found a factory update the property
                if (factory) {
                    dto.factory = factory;
                    delete dto.ref;
                }

                if (refDef) {
                    if (refDef.lazyFn) {
                        dto.lazyFn = refDef.lazyFn;
                        delete dto.ref;
                    }

                    if (!refDef.singleton) {
                        dto.lazy = true;
                    }

                }


            }

            properties.push(dto)
        }

        definition.properties = properties;
    }

    private _wireObjectInstance<T>(instance: T, definition: IDefinition, objectId: string) {

        if (instance[IsWiredSymbol]) {
            return;
        }
        //inject properties  and look up methods
        this._injectPropertiesAndLookUpMethods<T>(instance, definition, objectId);

        this._injectFactoryObject<T>(instance, objectId);

        this._injectAlias<T>(definition, instance);

        this._injectAliasFactory<T>(definition, instance);

        this._invokeInitMethod<T>(instance, definition);

        instance[IsWiredSymbol] = true;
    }

    private _getByParamObj(propObj: IParamInject, ref: string, args?: any[]) {
        return propObj.injector ? propObj.injector._get(ref, args) : this._get(ref, args)
    }

    private _injectPropertiesAndLookUpMethods<T>(object: T, objectDefinition: IDefinition, objectId: string) {
        if (object[IsWiredSymbol]) {
            return;
        }
        let obj, properties = objectDefinition.properties;

        for (let i = 0, length = (properties ? properties.length : 0); i < length; i++) {
            let prop = properties[i];
            if (prop.array) {

                object[prop.name] = (prop.array || []).map<IParamInject>((propObj: IParamInject) => propObj.value || this._getByParamObj(propObj, propObj.ref));
            } else if (prop.dictionary) {
                let injectObject = {};

                (prop.dictionary || []).forEach((propObj: IParamInject) => injectObject[propObj.key] = propObj.value || this._getByParamObj(propObj, propObj.ref));

                object[prop.name] = injectObject;

            } else if (prop.value) {

                object[prop.name] = prop.value;

            } else if (prop.ref) { //check if we have ref and we don't have factory with the same name


                if (prop.lazy) {
                    this._defineProperty(object, prop.name, Util.createDelegate(this._getByParamObj, this, [prop, prop.ref]), true)
                } else {
                    object[prop.name] = this._getByParamObj(prop, prop.ref);
                }

            } else if (prop.objectProperty) {
                obj = this._getByParamObj(prop, prop.objectProperty.object);

                object[prop.name] = obj[prop.objectProperty.property];

            } else if (prop.factory) {

                if (!this._factoriesObjects[objectId]) {
                    this._factoriesObjects[objectId] = {};
                }

                this._factoriesObjects[objectId][prop.name] = prop.factory;

            } else if (prop.factoryMethod) {

                object[prop.name] = Util.createDelegate(this._createFactoryMethod, this, [prop.factoryMethod, prop.injector || this])
            } else if (prop.lazyFn) {
                this._defineProperty(object, prop.name, prop.lazyFn)

            }

        }


    }

    private _defineProperty(object: any, name: string, fn: Function, cache: boolean = false) {
        let $self = this;
        if (!cache) {
            Object.defineProperty(object, name, {
                get() {
                    return fn($self);
                }
            });

            return;
        }


        let func = fn as any;
        func.__cached__ = {};

        Object.defineProperty(object, name, {

            get() {

                let cached = func.__cached__[name];

                if (cached) {
                    return cached;
                }

                let value = fn($self);

                func.__cached__[name] = value;

                return value;
            }
        });
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

    private _injectFactoryObject<T>(instance: T, objectId: string) {

        if (instance[IsWiredSymbol]) {
            return;
        }

        let factoryData = this._factoriesObjects[objectId];

        if (!factoryData) {
            return;
        }

        let keys = Object.keys(factoryData);

        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i], factory = factoryData[propName];

            instance[propName] = factory.injector ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
        }
    }

    // private _injectFactoryObjectInner(objectId: string) {
    //
    //     if (this._isInitialized) {
    //         return;
    //     }
    //
    //     let def = this._definitions[objectId];
    //
    //     //recursive load all object inject
    //     if (!def || def.$isFactoryWired) {
    //         return;
    //     }
    //
    //     def.$isFactoryWired = true;
    //
    //     for (let i = 0; i < def.inject.length; i++) {
    //
    //         let ref = def.inject[i].ref,
    //             localProp = this._definitions[ref],
    //             prop = this.getDefinition(ref);
    //
    //         if (ref && localProp && prop) {
    //             let instance = this._get(ref);
    //
    //             (localProp.injector ? localProp.injector : this)._injectFactoryObject(instance, prop.id)
    //         }
    //     }
    //
    // }

    private _injectAlias<T>(definition: IDefinition, instance: T) {
        if (instance[IsWiredSymbol]) {
            return;
        }

        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];
            let injector = prop.injector ? prop.injector : this;

            (prop.alias) && (instance[prop.name] = prop.indexBy
                ? Util.keyBy(injector.getAlias(prop.alias), prop.indexBy)
                : injector.getAlias(prop.alias));
        }
    }

    private _injectAliasFactory<T>(definition: IDefinition, instance: T) {
        if (instance[IsWiredSymbol]) {
            return;
        }

        for (let i = 0, length = (definition.properties ? definition.properties.length : 0); i < length; i++) {
            let prop = definition.properties[i];

            let injector = prop.injector ? prop.injector : this;

            if (prop.aliasFactory) {
                instance[prop.name] = prop.indexBy
                    ? Util.keyBy(injector.getAliasFactory(prop.aliasFactory), (item) => item.type[prop.indexBy])
                    : injector.getAliasFactory(prop.aliasFactory)
            }
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
