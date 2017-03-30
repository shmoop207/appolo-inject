"use strict";
import _ = require('lodash');
import {Injector} from "./inject";
import {IDefinition, IParamInject} from "./IDefinition";

export class Linq {

    private injector: Injector;

    private definition :IDefinition;

    constructor(injector: Injector, id: string, type: Function) {
        this.injector = injector;

        this.definition = {
            type: type,
            inject: [],
            alias: [],
            aliasFactory: [],
            args: []
        };

        injector.addDefinition(id, this.definition)
    }

    public type(type:Function):Linq {
        this.definition.type = type;

        return this;
    }

    public singleton(singleton:boolean = true):Linq {

        this.definition.singleton = _.isUndefined(singleton) ? true : singleton;
        return this
    }

    public inject(name:string|string[]|IParamInject|IParamInject[], inject?:string) {

        if (_.isString(name) && _.includes(name, " ")) {
            name = name.split(" ");
        }

        if (_.isArray(name)) {
            this.definition.inject.push.apply(this.definition.inject, name)
        } else if (_.isObject(name)) {
            this.definition.inject.push(name)
        }

        else if (_.toArray(arguments).length == 1 && _.isString(name)) {
            this.definition.inject.push({name: name, ref: name} )
        } else if (_.toArray(arguments).length == 2 && _.isString(name)) {
            this.definition.inject.push({name: name, ref: inject || name})
        }

        return this;
    }

    public injectFactoryMethod(name:string, factoryMethod:string):Linq {
        return this.inject({
            name: name,
            factoryMethod: factoryMethod
        })
    }

    public injectAlias(name:string, alias:string, indexBy?:string):Linq {
        return this.inject({
            name: name,
            alias: alias,
            indexBy: indexBy
        })
    }

    public injectAliasFactory(name:string, alias:string, indexBy?:string):Linq {
        return this.inject({
            name: name,
            aliasFactory: alias,
            indexBy: indexBy
        })
    }

    public injectArray(name:string, arr:IParamInject[]):Linq {
        return this.inject({
            name: name,
            array: arr
        })
    }


    public injectDictionary(name:string, dic:IParamInject[]):Linq {
        return this.inject({
            name: name,
            dictionary: dic
        })
    }

    public injectFactory(name:string, factory:string):Linq {
        return this.inject({
            name: name,
            factory: factory
        })
    }

    public injectObjectProperty(name:string, object:string, propertyName:string):Linq {
        return this.inject({
            name: name,
            objectProperty: {
                object: object,
                property: propertyName
            }
        })
    }

    public injectValue(name:string, value:any):Linq {
        return this.inject({
            name: name,
            value: value
        })
    }

    public alias(alias:string[]|string):Linq {
        if (_.isArray(alias)) {
            this.definition.alias.push.apply(this.definition.alias, alias)
        } else {
            this.definition.alias.push(alias)
        }

        return this;
    }

    public initMethod(initMethod?:string):Linq {
        this.definition.initMethod = initMethod || "initialize";
        return this;
    }

    public injectorAware():Linq {
        this.definition.injectorAware = true;
        return this;
    }


    public aliasFactory(aliasFactory:string|string[]):Linq {
        if (_.isArray(aliasFactory)) {
            this.definition.aliasFactory.push.apply(this.definition.aliasFactory, aliasFactory)
        } else {
            this.definition.aliasFactory.push(aliasFactory)
        }

        return this;
    }

    public args(args:IParamInject[]|IParamInject):Linq {
        if (_.isArray(args)) {
            this.definition.args.push.apply(this.definition.args, args)
        } else {
            this.definition.args.push(args)
        }
        return this;
    }

    public define(id:string, type:Function):Linq {
        return this.injector.define(id, type)
    }

    public initialize() {
        return this.injector.initialize()
    }


}