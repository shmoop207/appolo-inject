import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";
import {addDefinitionProperty} from "./decorators";

export function factoryMethodAsync(factoryMethod: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactoryMethodAsync", [Util.getClassNameOrId(factoryMethod)], true);
}
