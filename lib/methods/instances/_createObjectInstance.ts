import {IDefinition} from "../../interfaces/IDefinition";
import {Event} from "@appolo/events/index";
import {InjectEvent} from "../../events/events";
import {Injector} from "../../inject/inject";
import {_addSingletonAliases} from "../alias/_addSingletonAliases";
import {_wireObjectInstance} from "./_wireObjectInstance";

export function _createObjectInstance<T>(this: Injector, objectID: string, def: IDefinition, runtimeArgs?: any[]): T {
    let args = runtimeArgs || [], instance;

    if (!def) {
        throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
    }

    if (def.lazyFn) {
        return def.lazyFn(this)
    }

    instance = this._instances[objectID];

    if (instance) {
        return instance;
    }

    //loop over args and get the arg value or create arg object instance
    if (def.args.length) {
        let defArgs = [];
        for (let i = 0, length = def.args.length; i < length; i++) {
            let arg = def.args[i];
            defArgs.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, []));
        }
        args = [...defArgs, ...args]
    }

    try {
        instance = args.length ? new (def.type as any)(...args) : new (def.type as any)();
    } catch (e) {
        throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
    }

    (this._events.instanceCreated as Event<InjectEvent>).fireEvent({instance, definition: def});
    (this._events.instanceOwnCreated as Event<InjectEvent>).fireEvent({instance, definition: def});

    if (this._parent) {
        (this._parent.events.instanceCreated as Event<InjectEvent>).fireEvent({instance, definition: def})
    }

    if (def.singleton && def.lazy) {

        _addSingletonAliases.call(this, def, instance);
        _wireObjectInstance.call(this, instance, def, objectID);
        this._instances[objectID] = instance;
    } else if (def.singleton) {
        _addSingletonAliases.call(this, def, instance);
        this._instances[objectID] = instance;
    } else {

        _wireObjectInstance.call(this,instance, def, objectID);
    }

    if (def.injectorAware) {
        (instance as any).$injector = this;
    }

    return instance;
}
