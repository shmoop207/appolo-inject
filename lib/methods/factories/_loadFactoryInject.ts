import {IDefinition} from "../../interfaces/IDefinition";

export async function  _loadFactoryInject(def: IDefinition, refs?: { ids: {}, paths: string[] }) {
    for (let inject of def.inject) {
        let id = inject.ref || (inject.factory ? inject.factory.id : null);

        if (id) {
            await this.getFactory(id, JSON.parse(JSON.stringify(refs)))
        }
        if (inject.alias) {
            let ids = this.getAliasDefinitions(inject.alias as string).map((def => def.id));
            for (let id of ids) {
                await this.getFactory(id, JSON.parse(JSON.stringify(refs)))
            }
        }
    }
}
