import {Injector} from "../../inject/inject";
import {_createObjectInstance} from "./_createObjectInstance";

export function _get<T>(this: Injector, objectID: string, runtimeArgs?: any[]): T {

    let instance = this._instances[objectID] as T;

    if (instance) {
        return instance;
    }

    let def = this._definitions[objectID];

    if (def) {
        return def.injector && def.injector !== this
            ? def.injector.getObject(def.refName || objectID, runtimeArgs)
            : _createObjectInstance.call(this,objectID, this._definitions[objectID], runtimeArgs) as T;
    }

    if (this.parent) {
        return this.parent.getObject(objectID, runtimeArgs);
    }

    throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
}
