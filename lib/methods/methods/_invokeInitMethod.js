"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._invokeInitMethod = void 0;
const inject_1 = require("../../inject/inject");
function _invokeInitMethod(instance, definition) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    if (definition.initMethod) {
        instance[definition.initMethod]();
    }
}
exports._invokeInitMethod = _invokeInitMethod;
//# sourceMappingURL=_invokeInitMethod.js.map