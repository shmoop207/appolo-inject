import {_prepareInjectParams} from "../properties/_prepareInjectParams";
import {_prepareProperties} from "../properties/_prepareProperties";
import {_populateAliasFactory} from "../factories/_populateAliasFactory";
import {Injector} from "../../inject/inject";
import {Event} from "@appolo/events/index";
import {Util} from "../../utils/util";

export async function _initDefinitions(this: Injector) {
    if (this._isInitialized) {
        return;
    }

    await (this._events.beforeInitDefinitions as Event<void>).fireEventAsync();

    await Util.runRegroupByParallel<Injector>(this.children, inject => inject.options.parallel, injector => injector.initDefinitions());


    let keys = Object.keys(this._definitions);

    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], definition = this._definitions[objectId];

        _prepareInjectParams.call(this, definition);

        _prepareProperties.call(this, definition);

        if (definition.factory) {
            this._factories.push(definition.id);
        }

        if (definition.aliasFactory) {
            _populateAliasFactory.call(this, definition, objectId)
        }
    }
}
