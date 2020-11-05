import "reflect-metadata";
import {Define} from "../define/define";
import {Util} from "../utils/util";
import {Class} from "../interfaces/IDefinition";
import {singleton} from "./singleton";

export const InjectDefinitionsSymbol = "__injectDefinitions__";
export const InjectDefineSymbol = "__injectDefine__";
export const InjectParamSymbol = "__injectParam__";

export const EmptyFunction = () => {
};

export function addDefinition(name: string, args: any[], type: any): void {

    let injectDef = Util.getReflectData<{ name: string, args: any[] }[]>(InjectDefinitionsSymbol, type, []);

    injectDef.push({name: name, args: args})
}

export function addDefinitionClass(name: string, args: any[]): (fn: Function) => void {
    return function (name: string, args: any[], fn: Function) {
        addDefinition(name, args, fn)
    }.bind(null, name, args)
}

export function addDefinitionProperty(name: string, args: any[], pushClass: boolean = false): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {
    return function (name: string, args: any[], target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        args.unshift(propertyKey);
        if (pushClass) {
            args.push(target.constructor)
        }

        addDefinition(name, args, target.constructor)
    }.bind(null, name, args)
}
