import {addDefinitionClass} from "./decorators";

export function customParam(key: string, value): (fn: Function) => void {

    return addDefinitionClass("customParam", [key, value])
}
