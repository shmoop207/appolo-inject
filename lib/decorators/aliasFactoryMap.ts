import {addDefinitionProperty} from "./decorators";

export function aliasFactoryMap<T extends {new(...params:any[]):any}>(alias: string, indexBy: string | ((item:  T) => any)): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAliasFactory", [alias, {type: "map", index: indexBy}], true);

}
