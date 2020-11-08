"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._populateAliasFactory = void 0;
const util_1 = require("../../utils/util");
const _createFactoryMethodAsync_1 = require("./_createFactoryMethodAsync");
const _createFactoryMethod_1 = require("./_createFactoryMethod");
function _populateAliasFactory(definition, objectId) {
    for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {
        let aliasName = definition.aliasFactory[i];
        let delegateFn = util_1.Util.createDelegate(((definition.bootstrapMethodAsync || definition.initMethodAsync) ? _createFactoryMethodAsync_1._createFactoryMethodAsync : _createFactoryMethod_1._createFactoryMethod), this, [objectId, this]);
        delegateFn.type = definition.type;
        util_1.Util.mapPush(this._aliasFactory, aliasName, delegateFn);
    }
}
exports._populateAliasFactory = _populateAliasFactory;
//# sourceMappingURL=_populateAliasFactory.js.map