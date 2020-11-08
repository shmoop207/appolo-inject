"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = void 0;
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function array(arr) {
    return decorators_1.addDefinitionProperty("injectArray", [(arr || []).map(item => ({ ref: util_1.Util.getClassNameOrId(item) }))], true);
}
exports.array = array;
//# sourceMappingURL=array.js.map