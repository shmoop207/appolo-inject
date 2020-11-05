import {addDefinitionProperty} from "./decorators";

export function bootstrapAsync(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("bootstrapMethodAsync", []);
}
