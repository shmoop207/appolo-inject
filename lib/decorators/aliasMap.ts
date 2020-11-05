import {addDefinitionProperty} from "./decorators";

export function aliasMap<T>(alias: string, indexBy: string | ((item: T) => any)): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAlias", [alias, {type: "map", index: indexBy}], true);

}
