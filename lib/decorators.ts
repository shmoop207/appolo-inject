import _ = require('lodash');
import "reflect-metadata";
import {Define} from "./define";
import {Util} from "./util";

export const InjectDefinitionsSymbol = Symbol("__injectDefinitions__");
export const InjectDefineSymbol = Symbol("__injectDefine__");
export const InjectParamSymbol = Symbol("__injectParam__");

const EmptyFunction = () => {
};

function addDefinition(name: string, args: any[], type: any): void {

    let injectDef = Reflect.getOwnMetadata(InjectDefinitionsSymbol, type) || _.cloneDeep(Reflect.getMetadata(InjectDefinitionsSymbol, type));

    if (!injectDef) {
        injectDef = [];
        Reflect.defineMetadata(InjectDefinitionsSymbol, injectDef, type);
    }

    injectDef.push({name: name, args: args})
}

function addDefinitionClass(name: string, args: any[]): (fn: Function) => void {
    return function (name: string, args: any[], fn: Function) {
        addDefinition(name, args, fn)
    }.bind(null, name, args)
}

function addDefinitionProperty(name: string, args: any[]): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return function (name: string, args: any[], target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        args.unshift(propertyKey);
        addDefinition(name, args, target.constructor)
    }.bind(null, name, args)
}

export function define(id?: string): (fn: Function) => void {
    return function (id: string, fn: Function) {

        let define = new Define(id || Util.getClassName(fn), fn);

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


export function alias(alias: string): (fn: Function) => void {
    return addDefinitionClass("alias", [alias]);
}


export function aliasFactory(aliasFactory: string): (fn: Function) => void {

    return addDefinitionClass("aliasFactory", [aliasFactory]);
}


export function initMethod(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("initMethod", []);
}

export function inject(inject?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => any {

    return addDefinitionProperty("inject", [inject]);
}


export function injectFactoryMethod(factoryMethod: string | Function): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    if (typeof factoryMethod == "function") {
        factoryMethod = Util.getClassName(factoryMethod);
    }

    return addDefinitionProperty("injectFactoryMethod", [factoryMethod]);
}

export function injectAlias(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAlias", [alias, indexBy]);
}

export function injectAliasFactory(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAliasFactory", [alias, indexBy]);
}

export function injectArray(arr: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectArray", [arr]);
}

export function injectDictionary(dic: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectDictionary", [dic]);
}

export function injectFactory(factory?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactory", [factory]);
}

export function injectObjectProperty(object: string, propertyName: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectObjectProperty", [object, propertyName]);
}

export function injectValue(value: any): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectValue", [value]);
}

export function injectParam(name?: string) {
    return function (target: any, propertyKey: string, index: number) {
        let args = [];

        // //we have a constructor
        if (!propertyKey) {
            args = Util.getFunctionArgs(target);

            addDefinition("args", [{ref: name || args[index]}], target);

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