import {IDefinition} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {Injector, IsWiredSymbol} from "../../inject/inject";

export function _injectAliasFactory<T>(this: Injector, definition: IDefinition, instance: T) {
    if (instance[IsWiredSymbol]) {
        return;
    }

    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let prop = definition.inject[i];

        let injector = prop.injector ? prop.injector : this;

        if (!prop.aliasFactory) {
            continue;
        }

        let alias = injector.getAliasFactory(prop.aliasFactory as string);

        if (!prop.indexBy) {
            instance[prop.name] = alias;
        } else {
            let fn = function (key: any, type: "map" | "object" = "object") {
                let fn = (item) => Util.isFunction(key) ? (key as any)(item.type, i) : item.type[key as string];
                return type == "map" ? Util.keyByMap(alias, fn) : Util.keyBy(alias, fn)
            }

            instance[prop.name] = typeof prop.indexBy == "string"
                ? fn(prop.indexBy, "object")
                : fn(prop.indexBy.index, "map")
        }
    }
}
