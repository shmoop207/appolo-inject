import {IDefinition} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {Injector, IsWiredSymbol} from "../../inject/inject";

export function _injectAlias<T>(this: Injector, definition: IDefinition, instance: T) {
    if (instance[IsWiredSymbol]) {
        return;
    }

    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let prop = definition.inject[i];
        let injector = prop.injector ? prop.injector : this;

        if (!prop.alias) {
            continue;
        }

        let alias = injector.getAlias(prop.alias as string);

        instance[prop.name] = (!prop.indexBy)
            ? alias
            : ((typeof prop.indexBy == "string")
                ? Util.keyBy(alias, prop.indexBy as string)
                : Util.keyByMap(alias, prop.indexBy.index as string))

    }
}
