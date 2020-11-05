import {Injector, IsWiredSymbol} from "../../inject/inject";

export function _injectFactoryObject<T>(this: Injector, instance: T, objectId: string) {

    if (instance[IsWiredSymbol]) {
        return;
    }

    let factoryData = this._factoriesObjects[objectId];

    if (!factoryData) {
        return;
    }

    let keys = Object.keys(factoryData);

    for (let i = 0, len = keys.length; i < len; i++) {
        let propName = keys[i], factory = factoryData[propName];

        instance[propName] = factory.injector && factory.injector !== this ? factory.injector.getFactoryValue(factory.id) : this.getFactoryValue(factory.id);
    }
}
