"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.define = void 0;
const define_1 = require("../define/define");
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function define(id) {
    return function (id, fn) {
        let define = new define_1.Define(id || util_1.Util.getClassName(fn), fn);
        (Reflect.getMetadata(decorators_1.InjectDefinitionsSymbol, fn) || []).forEach((item) => define[item.name].apply(define, item.args));
        Reflect.defineMetadata(decorators_1.InjectDefineSymbol, define, fn);
    }.bind(null, id);
}
exports.define = define;
//# sourceMappingURL=define.js.map