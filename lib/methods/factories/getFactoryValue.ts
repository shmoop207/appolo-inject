import {IDefinition} from "../../interfaces/IDefinition";
import {Injector} from "../../inject/inject";

export function _getFactoryValue<T>(this: Injector, objectID: string, definitions?: IDefinition): T {
    let def = definitions || this._definitions[objectID];

    if (!def) {
        return this.parent ? this.parent.getFactoryValue<T>(objectID) : null;
    }

    if (def.injector && def.injector !== this) {
        return def.injector.getFactoryValue<T>(def.refName || def.id);
    }

    return this._factoriesValues[def.id];
}
