"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._prepareProperties = void 0;
const util_1 = require("../../utils/util");
function _prepareProperties(definition) {
    let properties = [];
    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let injectable = definition.inject[i];
        let dto = injectable;
        if (util_1.Util.isString(injectable)) {
            dto = {
                name: injectable,
                ref: injectable
            };
        }
        if (dto.parent && dto.parent !== definition.type) {
            let define = util_1.Util.getClassDefinition(dto.parent);
            dto.injector = define && define.definition.injector ? define.definition.injector : this._children.find(injector => !!injector.getDefinitionsValue().find(def => def.type === dto.parent));
        }
        let injector = dto.injector || this;
        if (dto.ref) {
            let refDef = injector.getDefinition(dto.ref), localDef = this._definitions[dto.ref], localInjectorDef = localDef && localDef.injector && (localDef.injector.getDefinition(localDef.refName || localDef.id)), factory;
            if (localInjectorDef && localInjectorDef.factory) {
                //try to get local def factory from child injector
                factory = { id: localDef.refName || localDef.id, injector: localDef.injector };
            }
            else if (refDef && refDef.factory) {
                factory = { id: refDef.id, injector: dto.injector };
            }
            //wohoo we found a factory update the property
            if (factory) {
                dto.factory = factory;
                delete dto.ref;
            }
            if (refDef) {
                if (refDef.lazyFn) {
                    dto.lazyFn = refDef.lazyFn;
                    delete dto.ref;
                }
                if (!refDef.singleton) {
                    dto.lazy = true;
                }
            }
        }
        properties.push(dto);
    }
    definition.inject = properties;
}
exports._prepareProperties = _prepareProperties;
//# sourceMappingURL=_prepareProperties.js.map