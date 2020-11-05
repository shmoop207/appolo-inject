import {_createObjectInstance} from "./_createObjectInstance";
import {Injector} from "../../inject/inject";
import {Event} from "@appolo/events/index";
import {Util} from "../../utils/util";

export async function _initInstances(this: Injector) {
    if (this._isInitialized) {
        return;
    }

    await (this._events.beforeInitInstances as Event<void>).fireEventAsync();

    await Util.runRegroupByParallel<Injector>(this.children, inject => inject.options.parallel, injector => injector.initInstances());


    let keys = Object.keys(this._definitions);

    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], definition = this._definitions[objectId];
        (definition.singleton && !definition.lazy) && (_createObjectInstance.call(this, objectId, definition));
    }
}
