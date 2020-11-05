import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";
import {addDefinitionProperty} from "./decorators";

export function objectProperty(object: string | Class, propertyName: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectObjectProperty", [Util.getClassNameOrId(object), propertyName], true);
}
