import _ = require('lodash');
import "reflect-metadata";
import {Define} from "./define";
import {Util} from "./util";
import {Class} from "./IDefinition";

export const InjectDefinitionsSymbol = "__injectDefinitions__";
export const InjectDefineSymbol = "__injectDefine__";
export const InjectParamSymbol = "__injectParam__";

const EmptyFunction = () => {
};

function addDefinition(name: string, args: any[], type: any): void {

    let injectDef = Util.getReflectData<{ name: string, args: any[] }[]>(InjectDefinitionsSymbol, type, []);

    injectDef.push({name: name, args: args})
}

function addDefinitionClass(name: string, args: any[]): (fn: Function) => void {
    return function (name: string, args: any[], fn: Function) {
        addDefinition(name, args, fn)
    }.bind(null, name, args)
}

function addDefinitionProperty(name: string, args: any[], pushClass: boolean = false): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return function (name: string, args: any[], target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        args.unshift(propertyKey);
        if (pushClass) {
            args.push(target.constructor)
        }

        addDefinition(name, args, target.constructor)
    }.bind(null, name, args)
}

export function define(id?: string): (fn: Function) => void {
    return function (id: string, fn: Function) {

        let define = new Define(id || Util.getClassName(fn), fn as Class);

        _.forEach(Reflect.getMetadata(InjectDefinitionsSymbol, fn), (item: { name: string, args: any[] }) => define[item.name].apply(define, item.args));

        Reflect.defineMetadata(InjectDefineSymbol, define, fn);

    }.bind(null, id);
}

export function singleton(singleton?: boolean): (fn: Function) => void {
    if (singleton === false) {
        return EmptyFunction;
    }
    return addDefinitionClass("singleton", [])
}

export function injectorAware(): (fn: Function) => void {

    return addDefinitionClass("injectorAware", [])
}

export function factory(factory?: boolean): (fn: Function) => void {
    if (factory === false) {
        return EmptyFunction;
    }
    return addDefinitionClass("factory", [])
}

export function lazy(lazy?: boolean): (fn: Function) => void {
    if (lazy === false) {
        return EmptyFunction;
    }

    return addDefinitionClass("lazy", [])
}


export function override(): (fn: Function) => void {

    return addDefinitionClass("override", [])
}


export function alias(alias: string): (fn: Function) => void {
    return addDefinitionClass("alias", [alias]);
}


export function aliasFactory(aliasFactory: string): (fn: Function) => void {

    return addDefinitionClass("aliasFactory", [aliasFactory]);
}


export function initMethod(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("initMethod", []);
}

export function inject(inject?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => any {
    return addDefinitionProperty("inject", [Util.getClassNameOrId(inject)], true);
}

export function injectLazy(inject?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => any {
    return addDefinitionProperty("injectLazy", [Util.getClassNameOrId(inject)], true);
}


export function injectFactoryMethod(factoryMethod: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactoryMethod", [Util.getClassNameOrId(factoryMethod)],true);
}

export function injectAlias(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAlias", [alias, indexBy],true);
}

export function injectAliasFactory(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAliasFactory", [alias, indexBy],true);
}

export function injectArray(arr: (string | Class)[]): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectArray", [_.map(arr, item => ({ref: Util.getClassNameOrId(item)}))],true);
}

export function injectDictionary(dic: { [index: string]: (string | Class) }): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    let args = _.map(dic, (item, key) => ({
        key: key,
        ref: Util.getClassNameOrId(item)
    }));
    return addDefinitionProperty("injectDictionary", [args],true);
}

export function injectFactory(factory?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactory", [Util.getClassNameOrId(factory)],true);
}

export function injectObjectProperty(object: string | Class, propertyName: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectObjectProperty", [Util.getClassNameOrId(object), propertyName],true);
}

export function injectValue(value: any): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectValue", [value]);
}


export function injectParam(name?: string | Class) {
    return function (target: any, propertyKey: string, index: number) {
        let args = [];

        // //we have a constructor
        if (!propertyKey) {
            args = Util.getFunctionArgs(target);

            addDefinition("args", [{ref: Util.getClassNameOrId(name) || args[index]}], target);

            return;
        }

        args = Util.getFunctionArgs(target.constructor.prototype[propertyKey]);

        let injectDef = Reflect.getOwnMetadata(InjectParamSymbol, target) || _.cloneDeep(Reflect.getMetadata(InjectParamSymbol, target));

        if (!injectDef) {
            injectDef = [];
            Reflect.defineMetadata(InjectParamSymbol, injectDef, target.constructor);
        }

        injectDef.push({
            param: name || args[index],
            method: propertyKey,
            index: index
        })

    }
}