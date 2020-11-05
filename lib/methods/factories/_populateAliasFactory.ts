import {IDefinition} from "../../interfaces/IDefinition";
import {Util} from "../../utils/util";
import {_createFactoryMethodAsync} from "./_createFactoryMethodAsync";
import {_createFactoryMethod} from "./_createFactoryMethod";

export function _populateAliasFactory(definition: IDefinition, objectId: string) {

    for (let i = 0, length = definition.aliasFactory ? definition.aliasFactory.length : 0; i < length; i++) {

        let aliasName = definition.aliasFactory[i];

        let delegateFn = Util.createDelegate(((definition.bootstrapMethodAsync || definition.initMethodAsync) ? _createFactoryMethodAsync : _createFactoryMethod), this, [objectId, this]);
        (delegateFn as any).type = definition.type;
        Util.mapPush(this._aliasFactory, aliasName, delegateFn)
    }
}
