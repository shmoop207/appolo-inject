"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleton = void 0;
const decorators_1 = require("./decorators");
function singleton(singleton) {
    if (singleton === false) {
        return decorators_1.EmptyFunction;
    }
    return (0, decorators_1.addDefinitionClass)("singleton", []);
}
exports.singleton = singleton;
//# sourceMappingURL=singleton.js.map