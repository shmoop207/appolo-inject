import {addDefinitionClass, addDefinitionProperty} from "./decorators";

export function aliasFactory(aliasFactory: string, indexBy?: string): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            injectAliasFactory(aliasFactory, indexBy).apply(this, arguments as any)
        } else {
            addDefinitionClass("aliasFactory", [aliasFactory]).apply(this, arguments as any)
        }
    }

}

function injectAliasFactory(alias: string, indexBy?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectAliasFactory", [alias, indexBy], true);
}
