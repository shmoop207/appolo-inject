"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._addDefinitions = void 0;
function _addDefinitions(definitions) {
    if (definitions instanceof Map) {
        definitions.forEach((value, key) => this.addDefinition(key, value));
    }
    else {
        for (let key in definitions) {
            if (definitions.hasOwnProperty(key)) {
                this.addDefinition(key, definitions[key]);
            }
        }
    }
    return this;
}
exports._addDefinitions = _addDefinitions;
//# sourceMappingURL=_addDefinitions.js.map