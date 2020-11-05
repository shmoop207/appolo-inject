import {Class} from "../interfaces/IDefinition";
import {Util} from "../utils/util";
import {addDefinition, addDefinitionProperty, InjectParamSymbol} from "./decorators";

export function inject(inject?: string | Class): (target: any, propertyKey: string, descriptor?: PropertyDescriptor | number) => any {

    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        if (!propertyKey || typeof descriptor == "number") {
            injectParam(inject).apply(this, arguments as any)
        } else {
            addDefinitionProperty("inject", [Util.getClassNameOrId(inject)], true).apply(this, arguments as any)
        }
    }

}


function injectParam(name?: string | Class) {
    return function (target: any, propertyKey: string, index: number) {
        let args = [];

        // //we have a constructor
        if (!propertyKey) {
            args = Util.getFunctionArgs(target);

            addDefinition("args", [{ref: Util.getClassNameOrId(name) || args[index]}, index], target);

            return;
        }

        args = Util.getFunctionArgs(target.constructor.prototype[propertyKey]);

        let injectDef = Reflect.getOwnMetadata(InjectParamSymbol, target) || Util.cloneDeep(Reflect.getMetadata(InjectParamSymbol, target));

        if (!injectDef) {
            injectDef = [];
            Reflect.defineMetadata(InjectParamSymbol, injectDef, target.constructor);
        }

        injectDef.push({
            param: name || args[index],
            method: propertyKey,
            index: index
        })

    }
}
