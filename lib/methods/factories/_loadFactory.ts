export async function  _loadFactory<T>(objectId: string) {
    let factoryData = this._factoriesObjects[objectId];


    let keys = Object.keys(factoryData || {});
    for (let propName of keys) {
        let factory = factoryData[propName];

        await this.loadFactory(factory.id);
    }

    this._factoriesValues[objectId] = await this.getFactory(objectId);
}
