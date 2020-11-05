import {Util} from "../../utils/util";
import {_loadFactoryInject} from "./_loadFactoryInject";
import {IFactory} from "../../interfaces/IFactory";
import {_wireObjectInstance} from "../instances/_wireObjectInstance";
import {_addSingletonAliases} from "../alias/_addSingletonAliases";
import {Injector} from "../../inject/inject";

export async function _getFactory<T>(this: Injector, objectID: string | Function, refs?: { ids: {}, paths: string[] }): Promise<T> {

    if (!refs) {
        refs = {ids: {}, paths: []}
    }

    objectID = Util.getClassNameOrId(objectID);

    let def = this._definitions[objectID as string];

    if (!def) {
        return this.parent ? this.parent.getFactory<T>(objectID, refs) : null;
    }

    if (def.injector && def.injector !== this) {
        return def.injector.getFactory<T>(def.refName || def.id, refs);
    }

    if (refs.ids[objectID]) {
        throw new Error(`Factory circular reference ${refs.paths.concat(objectID).join("-->")}`)
    }

    refs.paths.push(objectID);
    refs.ids[objectID] = true;

    let value = this._factoriesValues[def.id];

    if (value) {
        return value;
    }


    await _loadFactoryInject.call(this, def, refs);


    let factory = this._get<IFactory<T>>(def.id);

    _wireObjectInstance.call(this, factory, def, def.id);

    if (def.factory) {
        value = await factory.get();

        this._factoriesValues[def.id] = value;

        _addSingletonAliases.call(this, def, value, false);

        return value;
    }

}
