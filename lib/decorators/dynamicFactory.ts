import {addDefinitionClass} from "./decorators";

export function dynamicFactory(factory?: boolean): (fn: Function) => void {
    return addDefinitionClass("dynamicFactory", [factory])
}
