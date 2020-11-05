import {IDefinition} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {Injector} from "../../inject/inject";

export function _addSingletonAliases(this: Injector, def: IDefinition, instance: Object, checkFactory: boolean = true) {
    if (def.alias && def.alias.length && (!checkFactory || !def.factory)) {

        let keys = Object.keys(def.alias);

        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            Util.mapPush(this._alias, def.alias[key], instance)
        }
    }
}
