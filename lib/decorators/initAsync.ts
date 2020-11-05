import {addDefinitionProperty} from "./decorators";

export function initAsync(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("initMethodAsync", []);
}
