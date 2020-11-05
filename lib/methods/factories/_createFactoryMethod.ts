import {Injector} from "../../inject/inject";
import {IFactory} from "../../interfaces/IFactory";

export function _createFactoryMethod(this: Injector, objectId: string, injector: Injector, runtimeArgs?: any[]) {

    let instance = injector._get(objectId, runtimeArgs);
    let def = injector.getDefinition(objectId);
    return def.dynamicFactory ? (instance as IFactory<any>).get() : instance
}
