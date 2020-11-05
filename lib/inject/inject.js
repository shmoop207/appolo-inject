"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = exports.IsWiredSymbol = void 0;
const util_1 = require("../utils/util");
const events_1 = require("../events/events");
const _get_1 = require("../methods/instances/_get");
const _register_1 = require("../methods/definitions/_register");
const _loadFactory_1 = require("../methods/factories/_loadFactory");
const _addDefinitions_1 = require("../methods/definitions/_addDefinitions");
const _addDefinition_1 = require("../methods/definitions/_addDefinition");
const _getFactory_1 = require("../methods/factories/_getFactory");
const getFactoryValue_1 = require("../methods/factories/getFactoryValue");
const _initInitMethods_1 = require("../methods/methods/_initInitMethods");
const _initAlias_1 = require("../methods/alias/_initAlias");
const _initFactories_1 = require("../methods/factories/_initFactories");
const _initProperties_1 = require("../methods/properties/_initProperties");
const _initInstances_1 = require("../methods/instances/_initInstances");
const _initDefinitions_1 = require("../methods/definitions/_initDefinitions");
const _initBootstrapMethods_1 = require("../methods/methods/_initBootstrapMethods");
exports.IsWiredSymbol = "@__isWired__";
class Injector {
    constructor() {
        this._events = new events_1.Events();
        this._isInitialized = false;
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._factoriesObjects = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesValues = {};
        this._factories = [];
        this._children = [];
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
        value.children.push(this);
    }
    get options() {
        return this._options;
    }
    get children() {
        return this._children;
    }
    async initialize(options) {
        if (this._isInitialized) {
            return;
        }
        this._options = options || {};
        let definitions = {};
        Object.keys(definitions || {}).forEach(id => this.addDefinition(id, definitions[id]));
        //we have parent so we wait until parent.initialize
        if (this.parent && !this._options.immediate) {
            return;
        }
        await this._events.beforeInitialize.fireEventAsync();
        await this.initDefinitions();
        await this.initFactories();
        await this.initInstances();
        await this.initProperties();
        this.initAlias();
        await this.initInitMethods();
        await this.initBootstrapMethods();
        this._isInitialized = true;
    }
    initDefinitions() {
        return _initDefinitions_1._initDefinitions.call(this);
    }
    initInstances() {
        return _initInstances_1._initInstances.call(this);
    }
    initProperties() {
        return _initProperties_1._initProperties.call(this);
    }
    initFactories() {
        return _initFactories_1._initFactories.call(this);
    }
    initAlias() {
        return _initAlias_1._initAlias.call(this);
    }
    initInitMethods() {
        return _initInitMethods_1._initInitMethods.call(this);
    }
    initBootstrapMethods() {
        return _initBootstrapMethods_1._initBootstrapMethods.call(this);
    }
    getObject(objectID, runtimeArgs) {
        return this.get(objectID, runtimeArgs);
    }
    resolve(objectID, runtimeArgs) {
        try {
            return this.get(objectID, runtimeArgs);
        }
        catch (e) {
            return null;
        }
    }
    async getAsync(objectID, runtimeArgs) {
        let id = util_1.Util.getClassId(objectID);
        let def = this.getDefinition(id);
        let obj = this.get(objectID, runtimeArgs);
        if (def.initMethodAsync) {
            await obj[def.initMethodAsync]();
        }
        if (def.bootstrapMethodAsync) {
            await obj[def.bootstrapMethodAsync]();
        }
        return obj;
    }
    get(objectID, runtimeArgs) {
        objectID = util_1.Util.getClassNameOrId(objectID);
        let def = this._definitions[objectID];
        if (def && def.factory) {
            return this.getFactoryValue(objectID, def);
        }
        return this._get(objectID, runtimeArgs);
    }
    getFactoryValue(objectID, definitions) {
        return getFactoryValue_1._getFactoryValue.call(this, objectID, definitions);
    }
    getFactory(objectID, refs) {
        return _getFactory_1._getFactory.call(this, objectID, refs);
    }
    _get(objectID, runtimeArgs) {
        return _get_1._get.call(this, objectID, runtimeArgs);
    }
    getInstance(id) {
        let instance = this._instances[id];
        if (instance) {
            return instance;
        }
        if (this.parent) {
            return this.parent.getInstance(id);
        }
        return null;
    }
    hasInstance(id) {
        return !!this.getInstance(id);
    }
    addDefinition(objectId, definition) {
        return _addDefinition_1._addDefinition.call(this, objectId, definition);
    }
    removeDefinition(objectId) {
        delete this._definitions[objectId];
        return this;
    }
    addDefinitions(definitions) {
        return _addDefinitions_1._addDefinitions.call(this, definitions);
    }
    addObject(objectId, instance, silent) {
        return this.addInstance(objectId, instance, silent);
    }
    addInstance(objectId, instance, silent) {
        if (!silent && this._instances[objectId]) {
            console.log("Injector:object id already exists overriding: " + objectId);
        }
        this._instances[objectId] = instance;
        return this;
    }
    removeInstance(objectId) {
        delete this._instances[objectId];
        return this;
    }
    getObjectsByType(type) {
        let output = [];
        for (let key in this._instances) {
            if (this._instances.hasOwnProperty(key) && this._instances[key] instanceof type) {
                output.push(this._instances[key]);
            }
        }
        return output;
    }
    getInstances() {
        return this._instances;
    }
    getDefinitions() {
        return this._definitions;
    }
    getDefinitionsValue() {
        return Object.values(this._definitions);
    }
    getAliasDefinitions(alias) {
        return Object.values(this._definitions).filter(item => (item.alias || []).includes(alias));
    }
    getTypes() {
        return this.getDefinitionsValue().map(item => item.type);
    }
    hasDefinition(id) {
        return !!this.getDefinition(id);
    }
    getDefinition(id) {
        id = util_1.Util.getClassNameOrId(id);
        let def = this.getOwnDefinition(id);
        if (def) {
            return def;
        }
        if (this.parent) {
            return this.parent.getDefinition(id);
        }
    }
    hasOwnDefinition(id) {
        return !!this.getOwnDefinition(id);
    }
    getOwnDefinition(id) {
        id = util_1.Util.getClassNameOrId(id);
        let def = this._definitions[id];
        if (def) {
            return def.injector && def.injector !== this ? def.injector.getDefinition(def.refName || id) : def;
        }
    }
    addAlias(aliasName, value) {
        this.getAlias(aliasName).push(value);
    }
    removeAlias(aliasName, value) {
        util_1.Util.removeFromArray(this.getAlias(aliasName), value);
    }
    getAlias(aliasName) {
        return this._alias[aliasName] = this._alias[aliasName] || (this.parent ? this.parent.getAlias(aliasName) : []) || [];
    }
    addAliasFactory(aliasName, value) {
        this.getAliasFactory(aliasName).push(value);
    }
    removeAliasFactory(aliasName, value) {
        util_1.Util.removeFromArray(this.getAliasFactory(aliasName), value);
    }
    getAliasFactory(aliasName) {
        return this._aliasFactory[aliasName] = this._aliasFactory[aliasName] || (this.parent ? this.parent.getAliasFactory(aliasName) : []) || [];
    }
    getFactoryMethod(objectId) {
        return util_1.Util.createDelegate(this.get, this, [objectId]);
    }
    registerMulti(fns) {
        for (let i = 0, len = fns.length; i < len; i++) {
            this.register(fns[i]);
        }
        return this;
    }
    register(id, type, filePath) {
        return _register_1._register.call(this, id, type, filePath);
    }
    get events() {
        return this._events;
    }
    loadFactory(objectId) {
        return _loadFactory_1._loadFactory.call(this, objectId);
    }
    reset() {
        this._instances = {};
        this._definitions = {};
        this._options = {};
        this._alias = {};
        this._aliasFactory = {};
        this._factoriesObjects = {};
    }
}
exports.Injector = Injector;
//# sourceMappingURL=inject.js.map