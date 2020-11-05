import {Class} from "../interfaces/IDefinition";
import {addDefinitionClass, addDefinitionProperty} from "./decorators";
import {Util} from "../utils/util";

export function lazy(inject?: string | Class): (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void {

    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            injectLazy(inject).apply(this, arguments as any)
        } else {
            addDefinitionClass("lazy", []).apply(this, arguments as any);
        }
    }
}

function injectLazy(inject?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => any {
    return addDefinitionProperty("injectLazy", [Util.getClassNameOrId(inject)], true);
}

