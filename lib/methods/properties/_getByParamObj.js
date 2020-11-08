"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getByParamObj = void 0;
function _getByParamObj(propObj, ref, args) {
    return propObj.injector && propObj.injector !== this ? propObj.injector._get(ref, args) : this._get(ref, args);
}
exports._getByParamObj = _getByParamObj;
//# sourceMappingURL=_getByParamObj.js.map