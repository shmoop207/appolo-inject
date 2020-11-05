import {addDefinitionProperty} from "./decorators";

export function init(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("initMethod", []);
}
