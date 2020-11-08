"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getFactory = void 0;
const util_1 = require("../../utils/util");
const _loadFactoryInject_1 = require("./_loadFactoryInject");
const _wireObjectInstance_1 = require("../instances/_wireObjectInstance");
const _addSingletonAliases_1 = require("../alias/_addSingletonAliases");
async function _getFactory(objectID, refs) {
    if (!refs) {
        refs = { ids: {}, paths: [] };
    }
    objectID = util_1.Util.getClassNameOrId(objectID);
    let def = this._definitions[objectID];
    if (!def) {
        return this.parent ? this.parent.getFactory(objectID, refs) : null;
    }
    if (def.injector && def.injector !== this) {
        return def.injector.getFactory(def.refName || def.id, refs);
    }
    if (refs.ids[objectID]) {
        throw new Error(`Factory circular reference ${refs.paths.concat(objectID).join("-->")}`);
    }
    refs.paths.push(objectID);
    refs.ids[objectID] = true;
    let value = this._factoriesValues[def.id];
    if (value) {
        return value;
    }
    await _loadFactoryInject_1._loadFactoryInject.call(this, def, refs);
    let factory = this._get(def.id);
    _wireObjectInstance_1._wireObjectInstance.call(this, factory, def, def.id);
    if (def.factory) {
        value = await factory.get();
        this._factoriesValues[def.id] = value;
        _addSingletonAliases_1._addSingletonAliases.call(this, def, value, false);
        return value;
    }
}
exports._getFactory = _getFactory;
//# sourceMappingURL=_getFactory.js.map