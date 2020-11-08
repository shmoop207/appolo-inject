"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._initDefinitions = void 0;
const _prepareInjectParams_1 = require("../properties/_prepareInjectParams");
const _prepareProperties_1 = require("../properties/_prepareProperties");
const _populateAliasFactory_1 = require("../factories/_populateAliasFactory");
const util_1 = require("../../utils/util");
async function _initDefinitions() {
    if (this._isInitialized) {
        return;
    }
    await this._events.beforeInitDefinitions.fireEventAsync();
    await util_1.Util.runRegroupByParallel(this.children, inject => inject.options.parallel, injector => injector.initDefinitions());
    let keys = Object.keys(this._definitions);
    for (let i = 0, len = keys.length; i < len; i++) {
        let objectId = keys[i], definition = this._definitions[objectId];
        _prepareInjectParams_1._prepareInjectParams.call(this, definition);
        _prepareProperties_1._prepareProperties.call(this, definition);
        if (definition.factory) {
            this._factories.push(definition.id);
        }
        if (definition.aliasFactory) {
            _populateAliasFactory_1._populateAliasFactory.call(this, definition, objectId);
        }
    }
}
exports._initDefinitions = _initDefinitions;
//# sourceMappingURL=_initDefinitions.js.map