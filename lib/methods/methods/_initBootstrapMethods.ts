import {Event} from "@appolo/events/index";
import {_invokeInitMethod} from "./_invokeInitMethod";
import {_invokeBootStrapMethod} from "./_invokeBootStrapMethod";
import {Injector} from "../../inject/inject";

export async function _initBootstrapMethods(this: Injector) {

    if (this._isInitialized) {
        return;
    }

    let keys = Object.keys(this._instances);

    await (this._events.beforeBootstrapMethods as Event<void>).fireEventAsync();

    await Promise.all(this.children.map(injector => injector.initBootstrapMethods()));

    let asyncBootstrapPromises = [];

    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];

        let def = this._definitions[objectId];
        if (def) {
            (_invokeBootStrapMethod.call(this, instance, this._definitions[objectId]));
            def.bootstrapMethodAsync && asyncBootstrapPromises.push(instance[def.bootstrapMethodAsync]())
        }
    }

    if (asyncBootstrapPromises.length) {
        await Promise.all(asyncBootstrapPromises);
    }

    this._isInitialized = true;
    await (this._events.afterInitialize as Event<void>).fireEventAsync();
}
