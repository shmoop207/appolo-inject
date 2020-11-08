"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._loadFactoryInject = void 0;
async function _loadFactoryInject(def, refs) {
    for (let inject of def.inject) {
        let id = inject.ref || (inject.factory ? inject.factory.id : null);
        if (id) {
            await this.getFactory(id, JSON.parse(JSON.stringify(refs)));
        }
        if (inject.alias) {
            let ids = this.getAliasDefinitions(inject.alias).map((def => def.id));
            for (let id of ids) {
                await this.getFactory(id, JSON.parse(JSON.stringify(refs)));
            }
        }
    }
}
exports._loadFactoryInject = _loadFactoryInject;
//# sourceMappingURL=_loadFactoryInject.js.map