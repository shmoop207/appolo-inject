import {Class} from "../interfaces/IDefinition";
import {singleton} from "./singleton";
import {addDefinitionClass, addDefinitionProperty} from "./decorators";
import {Util} from "../utils/util";

export function factory(factory?: string | Class): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            injectFactory(factory).apply(this, arguments as any)
        } else {
            addDefinitionClass("factory", []).apply(this, arguments as any);
            singleton().apply(this, arguments as any)

        }
    }
}

function injectFactory(factory?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactory", [Util.getClassNameOrId(factory)], true);
}
