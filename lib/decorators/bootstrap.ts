import {addDefinitionProperty} from "./decorators";

export function bootstrap(): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("bootstrapMethod", []);
}
