import {IDefinition} from "../../interfaces/IDefinition";
import {Event} from "@appolo/events/index";
import {InjectEvent} from "../../events/events";
import {Injector, IsWiredSymbol} from "../../inject/inject";

export function _invokeBootStrapMethod<T>(this: Injector, instance: T, definition: IDefinition) {

    if (instance[IsWiredSymbol]) {
        return
    }

    if (definition.bootstrapMethod) {
        instance[definition.bootstrapMethod]();
    }

    instance[IsWiredSymbol] = true;

    (this._events.instanceInitialized as Event<InjectEvent>).fireEvent({instance, definition});
    (this._events.instanceOwnInitialized as Event<InjectEvent>).fireEvent({instance, definition});

    if (this._parent) {
        (this._parent._events.instanceInitialized as Event<InjectEvent>).fireEvent({instance, definition});
    }
}
