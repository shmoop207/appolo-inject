import {Event} from "@appolo/events/index";
import {_invokeInitMethod} from "./_invokeInitMethod";
import {_invokeBootStrapMethod} from "./_invokeBootStrapMethod";
import {Injector} from "../../inject/inject";

export async function _initInitMethods(this: Injector) {

    if (this._isInitialized) {
        return;
    }

    await (this._events.beforeInitMethods as Event<void>).fireEventAsync()

    let keys = Object.keys(this._instances);

    await Promise.all(this.children.map(injector => injector.initInitMethods()));

    let asyncInitPromises = [];

    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];

        let def = this._definitions[objectId];
        if (def) {
            (_invokeInitMethod.call(this, instance, this._definitions[objectId]));
            def.initMethodAsync && asyncInitPromises.push(instance[def.initMethodAsync]())
        }
    }

    if (asyncInitPromises.length) {
        await Promise.all(asyncInitPromises);
    }

}
