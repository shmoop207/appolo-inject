"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._createObjectInstance = void 0;
const _addSingletonAliases_1 = require("../alias/_addSingletonAliases");
const _wireObjectInstance_1 = require("./_wireObjectInstance");
function _createObjectInstance(objectID, def, runtimeArgs) {
    let args = runtimeArgs || [], instance;
    if (!def) {
        throw new Error(`Injector:can't find object definition for objectID:${objectID}`);
    }
    if (def.lazyFn) {
        return def.lazyFn(this);
    }
    instance = this._instances[objectID];
    if (instance) {
        return instance;
    }
    //loop over args and get the arg value or create arg object instance
    if (def.args.length) {
        let defArgs = [];
        for (let i = 0, length = def.args.length; i < length; i++) {
            let arg = def.args[i];
            defArgs.push(arg.hasOwnProperty("value") ? arg.value : this._get(arg.ref, []));
        }
        args = [...defArgs, ...args];
    }
    try {
        instance = args.length ? new def.type(...args) : new def.type();
    }
    catch (e) {
        throw new Error("Injector failed to create object objectID:" + objectID + "' \n" + e);
    }
    this._events.instanceCreated.fireEvent({ instance, definition: def });
    this._events.instanceOwnCreated.fireEvent({ instance, definition: def });
    if (this._parent) {
        this._parent.events.instanceCreated.fireEvent({ instance, definition: def });
    }
    if (def.singleton && def.lazy) {
        _addSingletonAliases_1._addSingletonAliases.call(this, def, instance);
        _wireObjectInstance_1._wireObjectInstance.call(this, instance, def, objectID);
        this._instances[objectID] = instance;
    }
    else if (def.singleton) {
        _addSingletonAliases_1._addSingletonAliases.call(this, def, instance);
        this._instances[objectID] = instance;
    }
    else {
        _wireObjectInstance_1._wireObjectInstance.call(this, instance, def, objectID);
    }
    if (def.injectorAware) {
        instance.$injector = this;
    }
    return instance;
}
exports._createObjectInstance = _createObjectInstance;
//# sourceMappingURL=_createObjectInstance.js.map