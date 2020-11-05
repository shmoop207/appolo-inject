"use strict";
import {IOptions} from "../interfaces/IOptions";
import {IFactory} from "../interfaces/IFactory";
import {Class, IDefinition, IParamInject} from "../interfaces/IDefinition";
import {Define} from "../define/define";
import {InjectDefineSymbol, InjectParamSymbol} from "../decorators/decorators";
import {Util} from "../utils/util";
import {Event, IEvent} from "@appolo/events";
import {Events, InjectEvent} from "../events/events";

import {_get} from "../methods/instances/_get";

import {_register} from "../methods/definitions/_register";
import {_loadFactory} from "../methods/factories/_loadFactory";
import {_addDefinitions} from "../methods/definitions/_addDefinitions";
import {_addDefinition} from "../methods/definitions/_addDefinition";
import {_getFactory} from "../methods/factories/_getFactory";
import {_getFactoryValue} from "../methods/factories/getFactoryValue";
import {_initInitMethods} from "../methods/methods/_initInitMethods";
import {_initAlias} from "../methods/alias/_initAlias";
import {_initFactories} from "../methods/factories/_initFactories";
import {_initProperties} from "../methods/properties/_initProperties";
import {_initInstances} from "../methods/instances/_initInstances";
import {_initDefinitions} from "../methods/definitions/_initDefinitions";
import {_initBootstrapMethods} from "../methods/methods/_initBootstrapMethods";

type keyObject = { [index: string]: Object }

export const IsWiredSymbol = "@__isWired__";

export class Injector {

    protected _definitions: { [index: string]: IDefinition };
    protected _instances: keyObject;
    protected _factoriesObjects: { [index: string]: { [index: string]: { id: string, injector?: Injector } } };
    protected _factoriesValues: { [index: string]: any };
    protected _alias: { [index: string]: Object[] };
    protected _aliasFactory: { [index: string]: Object[] };

    protected _factories: string[];

    protected _parent: Injector;
    protected _children: Injector[];

    protected _events = new Events()

    protected _options: IOptions;

    protected _isInitialized: boolean = false;

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

        await (this._events.beforeInitialize as Event<void>).fireEventAsync();

        await this.initDefinitions();

        await this.initFactories();

        await this.initInstances();

        await this.initProperties();

        this.initAlias();

        await this.initInitMethods();

        await this.initBootstrapMethods();

        this._isInitialized = true;
    }

    protected initDefinitions() {
        return _initDefinitions.call(this);
    }

    protected initInstances() {
        return _initInstances.call(this);
    }

    protected initProperties() {
        return _initProperties.call(this);

    }

    protected initFactories() {
        return _initFactories.call(this);
    }

    protected initAlias() {

        return _initAlias.call(this);

    }

    protected initInitMethods() {
        return _initInitMethods.call(this);
    }

    protected initBootstrapMethods() {
        return _initBootstrapMethods.call(this);
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

    public async getAsync<T>(objectID: string | Function, runtimeArgs?: any[]): Promise<T> {

        let id = Util.getClassId(objectID);

        let def = this.getDefinition(id);

        let obj = this.get<T>(objectID, runtimeArgs);

        if (def.initMethodAsync) {
            await obj[def.initMethodAsync]();
        }

        if (def.bootstrapMethodAsync) {
            await obj[def.bootstrapMethodAsync]();
        }

        return obj;

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
        return _getFactoryValue.call(this, objectID, definitions) as T
    }

    public getFactory<T>(objectID: string | Function, refs?: { ids: {}, paths: string[] }): Promise<T> {

        return _getFactory.call(this, objectID, refs) as Promise<T>
    }

    protected _get<T>(objectID: string, runtimeArgs?: any[]): T {

        return _get.call(this, objectID, runtimeArgs) as T
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


        return _addDefinition.call(this, objectId, definition);
    }

    public removeDefinition(objectId: string): Injector {

        delete this._definitions[objectId];

        return this;
    }

    public addDefinitions(definitions: { [index: string]: IDefinition } | Map<string, IDefinition>): Injector {

        return _addDefinitions.call(this, definitions);
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


    public getDefinition(id: string | Function): IDefinition {

        id = Util.getClassNameOrId(id);

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

    public getOwnDefinition(id: string | Function): IDefinition {

        id = Util.getClassNameOrId(id);

        let def = this._definitions[id];

        if (def) {
            return def.injector && def.injector !== this ? def.injector.getDefinition(def.refName || id) : def;
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

        return _register.call(this, id, type, filePath);
    }

    public get events(): Events {
        return this._events;
    }

    protected loadFactory<T>(objectId: string): Promise<void> {
        return _loadFactory.call(this, objectId);
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


