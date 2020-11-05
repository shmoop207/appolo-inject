import {addDefinitionProperty} from "./decorators";

export function value(value: any): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectValue", [value]);
}
