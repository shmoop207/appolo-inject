"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._invokeBootStrapMethod = void 0;
const inject_1 = require("../../inject/inject");
function _invokeBootStrapMethod(instance, definition) {
    if (instance[inject_1.IsWiredSymbol]) {
        return;
    }
    if (definition.bootstrapMethod) {
        instance[definition.bootstrapMethod]();
    }
    instance[inject_1.IsWiredSymbol] = true;
    this._events.instanceInitialized.fireEvent({ instance, definition });
    this._events.instanceOwnInitialized.fireEvent({ instance, definition });
    if (this._parent) {
        this._parent._events.instanceInitialized.fireEvent({ instance, definition });
    }
}
exports._invokeBootStrapMethod = _invokeBootStrapMethod;
//# sourceMappingURL=_invokeBootStrapMethod.js.map