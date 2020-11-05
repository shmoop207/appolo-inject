import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";
import {addDefinitionProperty} from "./decorators";

export function dictionary(dic: { [index: string]: (string | Class) }): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => void {


    let args = Object.keys(dic).map(key => ({
        key: key,
        ref: Util.getClassNameOrId(dic[key])
    }));
    return addDefinitionProperty("injectDictionary", [args], true);
}

