import {Injector} from "../../inject/inject";
import {IFactory} from "../../interfaces/IFactory";

export async function  _createFactoryMethodAsync(this:Injector,objectId: string, injector: Injector, runtimeArgs?: any[]) {

    let instance = await injector.getAsync(objectId, runtimeArgs);
    let def = injector.getDefinition(objectId);
    return def.dynamicFactory ? (instance as IFactory<any>).get() : instance
}
