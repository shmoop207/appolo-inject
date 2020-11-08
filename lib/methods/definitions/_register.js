"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._register = void 0;
const define_1 = require("../../define/define");
const util_1 = require("../../utils/util");
const decorators_1 = require("../../decorators/decorators");
function _register(id, type, filePath) {
    if (util_1.Util.isFunction(id)) {
        type = id;
        id = util_1.Util.getClassName(type);
    }
    let define = type
        ? (Reflect.getMetadata(decorators_1.InjectDefineSymbol, type) || new define_1.Define(id, type))
        : new define_1.Define(id);
    define = define.clone();
    define.path(filePath);
    define.injector(this);
    this.addDefinition(define.definition.id || id, define.definition);
    return define;
}
exports._register = _register;
//# sourceMappingURL=_register.js.map