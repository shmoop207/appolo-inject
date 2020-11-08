"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectProperty = void 0;
const util_1 = require("../utils/util");
const decorators_1 = require("./decorators");
function objectProperty(object, propertyName) {
    return decorators_1.addDefinitionProperty("injectObjectProperty", [util_1.Util.getClassNameOrId(object), propertyName], true);
}
exports.objectProperty = objectProperty;
//# sourceMappingURL=objectProperty.js.map