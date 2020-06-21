"use strict";
import {Class, IDefinition, IParamInject} from "./IDefinition";
import {Util} from "./util";

export class Define {

    protected _definition: IDefinition;

    protected _id: string;

    constructor(id: string, type?: Class) {

        if (!id) {
            return
        }

        this._id = id;


        this._definition = {
            id: this._id,
            type: type,
            inject: [],
            alias: [],
            aliasFactory: [],
            args: [],
            path: "",
            customParams: {},
            override: false
        };

    }

    public customParam(key: string, value: any) {

        if (this._definition.customParams[key]) {
            this._definition.customParams[key] = [];
        }

        this._definition.customParams[key].push(value);

        return this
    }

    public get definition(): IDefinition {
        return this._definition;
    }

    public type(type: Function): this {
        this._definition.type = type;

        return this;
    }

    public singleton(singleton: boolean = true): this {

        this._definition.singleton = Util.isUndefined(singleton) ? true : singleton;
        return this
    }

    public factory(factory: boolean = true): this {

        this._definition.factory = Util.isUndefined(factory) ? true : factory;

        //factory must be singleton
        if (this._definition.factory) {
            this._definition.singleton = true;
        }

        return this
    }

    public dynamicFactory(factory: boolean = true): this {

        this._definition.dynamicFactory = Util.isUndefined(factory) ? true : factory;

        return this
    }

    public path(path: string): this {
        this._definition.path = path;
        return this;
    }

    public injectLazyFn(name, fn: Function) {
        this.inject({name, lazyFn: fn})
    }

    public lazy(lazy: boolean = true): this {

        this._definition.lazy = Util.isUndefined(lazy) ? true : lazy;
        return this
    }

    public override(override: boolean = true): this {

        this._definition.override = Util.isUndefined(override) ? true : override;
        return this
    }

    public inject(name: string | string[] | IParamInject | IParamInject[], inject?: string, parent?: Class): this {

        if (Util.isString(name) && (name as string).includes(" ")) {
            name = (name as string).split(" ");
        }

        if (Array.isArray(name)) {
            this._definition.inject.push.apply(this._definition.inject, name)
        } else if (Util.isObject(name)) {
            this._definition.inject.push(name as IParamInject)
        } else {
            this._definition.inject.push({name: name as string, ref: inject || (name as string), parent: parent})
        }

        // else if (_.toArray(arguments).length == 1 && _.isString(name)) {
        //     this._definition.inject.push({name: name, ref: name})
        // } else if (_.toArray(arguments).length == 2 && _.isString(name)) {
        //     this._definition.inject.push({name: name, ref: inject || name})
        // } else {
        //
        // }

        return this;
    }

    public injectLazy(name: string, inject?: string, parent?: Class): this {
        return this.inject({
            name: name,
            ref: inject || name,
            lazy: true,
            parent: parent
        })
    }

    public injectFactoryMethod(name: string, factoryMethod: string, parent?: Class): this {
        return this.inject({
            name: name,
            factoryMethod: factoryMethod,
            parent: parent
        })
    }

    public injectAlias(name: string, alias: string, indexBy?: string, parent?: Class): this {
        return this.inject({
            name: name,
            alias: alias,
            indexBy: indexBy, parent
        })
    }

    public injectAliasFactory(name: string, alias: string, indexBy?: string, parent?: Class): this {
        return this.inject({
            name: name,
            aliasFactory: alias,
            indexBy: indexBy, parent
        })
    }

    public injectArray(name: string, arr: IParamInject[], parent?: Class): this {
        return this.inject({
            name: name,
            array: arr, parent
        })
    }


    public injectDictionary(name: string, dic: IParamInject[], parent?: Class): this {
        return this.inject({
            name: name,
            dictionary: dic, parent
        })
    }

    public injectFactory(name: string, factory?: string, parent?: Class): this {
        return this.inject({
            name: name,
            factory: {id: factory || name},
            parent
        })
    }

    public injectObjectProperty(name: string, object: string, propertyName: string): this {
        return this.inject({
            name: name,
            objectProperty: {
                object: object,
                property: propertyName
            }
        })
    }

    public injectValue(name: string, value: any): this {
        return this.inject({
            name: name,
            value: value
        })
    }

    public alias(alias: string[] | string): this {
        if (Array.isArray(alias)) {
            this._definition.alias.push.apply(this._definition.alias, alias)
        } else {
            this._definition.alias.push(alias)
        }

        return this;
    }

    public initMethod(initMethod?: string): this {
        this._definition.initMethod = initMethod || "initialize";
        return this;
    }

    public initMethodAsync(initMethod?: string): this {
        this._definition.initMethodAsync = initMethod || "initialize";
        return this;
    }

    public injectorAware(): this {
        this._definition.injectorAware = true;
        return this;
    }


    public aliasFactory(aliasFactory: string | string[]): this {
        if (Array.isArray(aliasFactory)) {
            this._definition.aliasFactory.push.apply(this._definition.aliasFactory, aliasFactory)
        } else {
            this._definition.aliasFactory.push(aliasFactory)
        }

        return this;
    }

    public args(args: IParamInject[] | IParamInject): this {
        if (Array.isArray(args)) {
            this._definition.args.push.apply(this._definition.args, args)
        } else {
            this._definition.args.push(args)
        }
        return this;
    }


}
