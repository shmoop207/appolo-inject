import {addDefinitionClass} from "./decorators";

export function injectorAware(): (fn: Function) => void {

    return addDefinitionClass("injectorAware", [])
}
