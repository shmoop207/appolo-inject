import {_injectFactoryObject} from "../factories/_injectFactoryObject";
import {_injectAlias} from "./_injectAlias";
import {_injectAliasFactory} from "./_injectAliasFactory";
import {Injector} from "../../inject/inject";

export function _initAlias(this: Injector) {

    if (this._isInitialized) {
        return;
    }

    let keys = Object.keys(this._instances);

    this.children.forEach(injector => injector.initAlias());


    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];

        let def = this._definitions[objectId];

        if (def) {
            _injectFactoryObject.call(this, instance, objectId);
            _injectAlias.call(this, def, instance);
            _injectAliasFactory.call(this, def, instance);
        }
    }

}
