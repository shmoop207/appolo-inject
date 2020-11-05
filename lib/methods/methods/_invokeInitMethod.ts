import {IDefinition} from "../../interfaces/IDefinition";
import {IsWiredSymbol} from "../../inject/inject";

export function _invokeInitMethod<T>(instance: T, definition: IDefinition) {

    if (instance[IsWiredSymbol]) {
        return
    }

    if (definition.initMethod) {
        instance[definition.initMethod]();
    }

}
