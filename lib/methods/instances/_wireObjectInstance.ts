import {IDefinition} from "../../interfaces/IDefinition";
import {_injectPropertiesAndLookUpMethods} from "../properties/_injectPropertiesAndLookUpMethods";
import {_injectAliasFactory} from "../alias/_injectAliasFactory";
import {Injector, IsWiredSymbol} from "../../inject/inject";
import {_injectFactoryObject} from "../factories/_injectFactoryObject";
import {_invokeBootStrapMethod} from "../methods/_invokeBootStrapMethod";
import {_invokeInitMethod} from "../methods/_invokeInitMethod";
import {_injectAlias} from "../alias/_injectAlias";

export function _wireObjectInstance<T>(this: Injector, instance: T, definition: IDefinition, objectId: string) {

    if (instance[IsWiredSymbol]) {
        return;
    }
    //inject properties  and look up methods
    _injectPropertiesAndLookUpMethods.call(this, instance, definition, objectId);

    _injectFactoryObject.call(this, instance, objectId);

    _injectAlias.call(this, definition, instance);

    _injectAliasFactory.call(this, definition, instance);

    _invokeInitMethod.call(this, instance, definition);

    _invokeBootStrapMethod.call(this, instance, definition);

    instance[IsWiredSymbol] = true;
}
