import {addDefinitionProperty} from "./decorators";
import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";

export function factoryMethod(factoryMethod: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectFactoryMethod", [Util.getClassNameOrId(factoryMethod)], true);
}
