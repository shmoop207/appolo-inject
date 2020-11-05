import {IDefinition} from "../../interfaces/IDefinition";
import {InjectParamSymbol} from "../../decorators/decorators";
import {Util} from "../../utils/util";
import {Injector} from "../../inject/inject";

export function _prepareInjectParams(this: Injector, def: IDefinition) {

    let $self = this;

    if (!def.type) {
        return
    }
    let params = Reflect.getMetadata(InjectParamSymbol, def.type);

    if (!params || !Util.isFunction(def.type)) {
        return
    }

    let paramGroups = Util.groupByArray(params, "method");

    Object.keys(paramGroups).forEach(method => {
        let items: any[] = paramGroups[method];
        let oldFn = def.type.prototype[method];
        oldFn = oldFn.originFn || oldFn;

        def.type.prototype[method] = function (...args: any[]) {
            for (let i = 0, length = (items.length || 0); i < length; i++) {
                args[items[i].index] = $self.getObject(items[i].param)
            }

            return oldFn.apply(this, args)
        };
        def.type.prototype[method].originFn = oldFn;

    });
}
