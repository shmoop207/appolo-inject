import {IDefinition} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {Injector} from "../../inject/inject";

export function _prepareProperties(this: Injector, definition: IDefinition): void {

    let properties = [];


    for (let i = 0, length = (definition.inject ? definition.inject.length : 0); i < length; i++) {
        let injectable = definition.inject[i];

        let dto = injectable;

        if (Util.isString(injectable)) {

            dto = {
                name: injectable as string,
                ref: injectable as string
            }
        }

        if (dto.parent && dto.parent !== definition.type) {

            let define = Util.getClassDefinition(dto.parent);

            dto.injector = define && define.definition.injector ? define.definition.injector : this._children.find(injector => !!injector.getDefinitionsValue().find(def => def.type === dto.parent))
        }

        let injector = dto.injector || this;

        if (dto.ref) {
            let refDef = injector.getDefinition(dto.ref),
                localDef = this._definitions[dto.ref],
                localInjectorDef = localDef && localDef.injector && (localDef.injector.getDefinition(localDef.refName || localDef.id)),
                factory;

            if (localInjectorDef && localInjectorDef.factory) {
                //try to get local def factory from child injector
                factory = {id: localDef.refName || localDef.id, injector: localDef.injector};

            } else if (refDef && refDef.factory) {
                factory = {id: refDef.id, injector: dto.injector};
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

        properties.push(dto)
    }

    definition.inject = properties;
}
