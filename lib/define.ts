"use strict";
import _ = require('lodash');
import {Class, IDefinition, IParamInject} from "./IDefinition";

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
            override: false
        };

    }

    public get definition(): IDefinition {
        return this._definition;
    }

    public type(type: Function): this {
        this._definition.type = type;

        return this;
    }

    public singleton(singleton: boolean = true): this {

        this._definition.singleton = _.isUndefined(singleton) ? true : singleton;
        return this
    }

    public factory(factory: boolean = true): this {

        this._definition.factory = _.isUndefined(factory) ? true : factory;
        return this
    }

    public path(path: string): this {
        this._definition.path = path;
        return this;
    }

    public lazy(lazy: boolean = true): this {

        this._definition.lazy = _.isUndefined(lazy) ? true : lazy;
        return this
    }

    public override(override: boolean = true): this {

        this._definition.lazy = _.isUndefined(override) ? true : override;
        return this
    }

    public inject(name: string | string[] | IParamInject | IParamInject[], inject?: string): this {

        if (_.isString(name) && _.includes(name, " ")) {
            name = name.split(" ");
        }

        if (_.isArray(name)) {
            this._definition.inject.push.apply(this._definition.inject, name)
        } else if (_.isObject(name)) {
            this._definition.inject.push(name as IParamInject)
        }

        else if (_.toArray(arguments).length == 1 && _.isString(name)) {
            this._definition.inject.push({name: name, ref: name})
        } else if (_.toArray(arguments).length == 2 && _.isString(name)) {
            this._definition.inject.push({name: name, ref: inject || name})
        }

        return this;
    }

    public injectFactoryMethod(name: string, factoryMethod: string): this {
        return this.inject({
            name: name,
            factoryMethod: factoryMethod
        })
    }

    public injectAlias(name: string, alias: string, indexBy?: string): this {
        return this.inject({
            name: name,
            alias: alias,
            indexBy: indexBy
        })
    }

    public injectAliasFactory(name: string, alias: string, indexBy?: string): this {
        return this.inject({
            name: name,
            aliasFactory: alias,
            indexBy: indexBy
        })
    }

    public injectArray(name: string, arr: IParamInject[]): this {
        return this.inject({
            name: name,
            array: arr
        })
    }


    public injectDictionary(name: string, dic: IParamInject[]): this {
        return this.inject({
            name: name,
            dictionary: dic
        })
    }

    public injectFactory(name: string, factory?: string): this {
        return this.inject({
            name: name,
            factory: {id: factory || name}
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
        if (_.isArray(alias)) {
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

    public injectorAware(): this {
        this._definition.injectorAware = true;
        return this;
    }


    public aliasFactory(aliasFactory: string | string[]): this {
        if (_.isArray(aliasFactory)) {
            this._definition.aliasFactory.push.apply(this._definition.aliasFactory, aliasFactory)
        } else {
            this._definition.aliasFactory.push(aliasFactory)
        }

        return this;
    }

    public args(args: IParamInject[] | IParamInject): this {
        if (_.isArray(args)) {
            this._definition.args.push.apply(this._definition.args, args)
        } else {
            this._definition.args.push(args)
        }
        return this;
    }


}