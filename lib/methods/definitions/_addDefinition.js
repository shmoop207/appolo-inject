"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._addDefinition = void 0;
function _addDefinition(objectId, definition) {
    //we have definition and is already override mode so we do nothing
    if (this._definitions[objectId] && this._definitions[objectId].override && !definition.override) {
        return this;
    }
    //we have definition and the new definition is not in override mode so we throw error
    if (this._definitions[objectId] && !definition.override) {
        throw new Error(`Injector:definition id ${objectId} already exists use override decorator`);
    }
    let cloned = Object.assign({}, { id: objectId, args: [], inject: [], alias: [], aliasFactory: [] }, definition);
    Object.assign(definition, cloned);
    this._definitions[objectId] = definition;
    return this;
}
exports._addDefinition = _addDefinition;
//# sourceMappingURL=_addDefinition.js.map