import {Util} from "../../utils/util";
import {Injector} from "../../inject/inject";
import {Event} from "@appolo/events/index";

export async function _initFactories(this: Injector) {
    if (this._isInitialized) {
        return;
    }

    await (this._events.beforeInitFactories as Event<void>).fireEventAsync();

    await Util.runRegroupByParallel<Injector>(this.children, inject => inject.options.parallel, injector => injector.initFactories());

    for (let factory of this._factories) {
        await this.loadFactory(factory);
    }
}
