import {_injectPropertiesAndLookUpMethods} from "./_injectPropertiesAndLookUpMethods";
import {Injector} from "../../inject/inject";
import {Event} from "@appolo/events/index";
import {Util} from "../../utils/util";

export async function _initProperties(this: Injector) {
    if (this._isInitialized) {
        return;
    }

    await (this._events.beforeInitProperties as Event<void>).fireEventAsync();

    await Util.runRegroupByParallel<Injector>(this.children, inject => inject.options.parallel, injector => injector.initProperties());


    let keys = Object.keys(this._instances);

    //loop over instances and inject properties and look up methods only if exist in def
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], instance = this._instances[objectId];

        if (this._definitions[objectId]) {
            _injectPropertiesAndLookUpMethods.call(this, instance, this._definitions[objectId], objectId);
        }
    }

}
