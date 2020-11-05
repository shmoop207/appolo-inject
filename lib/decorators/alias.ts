import {addDefinitionClass, addDefinitionProperty} from "./decorators";

export function alias(alias: string, indexBy?: string): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            injectAlias(alias, indexBy).apply(this, arguments as any)
        } else {
            addDefinitionClass("alias", [alias]).apply(this, arguments as any);
        }
    }

}


function injectAlias(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAlias", [alias, indexBy], true);
}
