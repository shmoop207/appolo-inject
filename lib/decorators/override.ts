import {addDefinitionClass} from "./decorators";

export function override(): (fn: Function) => void {

    return addDefinitionClass("override", [])
}
