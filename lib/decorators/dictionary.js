"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dictionary = void 0;
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function dictionary(dic) {
    let args = Object.keys(dic).map(key => ({
        key: key,
        ref: util_1.Util.getClassNameOrId(dic[key])
    }));
    return (0, decorators_1.addDefinitionProperty)("injectDictionary", [args], true);
}
exports.dictionary = dictionary;
//# sourceMappingURL=dictionary.js.map