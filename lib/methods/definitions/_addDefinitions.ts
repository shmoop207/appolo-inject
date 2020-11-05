import {IDefinition} from "../../interfaces/IDefinition";
import {Injector} from "../../inject/inject";

export function _addDefinitions(this: Injector, definitions: { [index: string]: IDefinition } | Map<string, IDefinition>): Injector {

    if (definitions instanceof Map) {
        definitions.forEach((value, key) => this.addDefinition(key, value))
    } else {
        for (let key in definitions) {
            if (definitions.hasOwnProperty(key)) {
                this.addDefinition(key, definitions[key])
            }
        }
    }

    return this;
}
