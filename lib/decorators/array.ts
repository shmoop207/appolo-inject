import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";
import {addDefinitionProperty} from "./decorators";

export function array(arr: (string | Class)[]): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {

    return addDefinitionProperty("injectArray", [(arr || []).map(item => ({ref: Util.getClassNameOrId(item)}))], true);
}

