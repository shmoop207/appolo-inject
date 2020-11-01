export default require('./lib/inject');
export {IDefinition, IParamInject} from './lib/IDefinition'
export {IFactory} from './lib/IFactory'
export {IOptions} from './lib/IOptions'
export {Injector, createContainer} from './lib/inject'
export {Define} from './lib/define'
export {Util} from './lib/util'
export {
    InjectDefineSymbol,
    define,
    singleton,
    inject,
    factoryMethod,
    init,
    array,
    dictionary,
    factory,
    objectProperty,
    value,
    aliasFactory,
    alias,
    lazy,
    override,
    dynamicFactory,
    customFn,
    initAsync,
    customParam,
    factoryMethodAsync,
    bootstrapAsync,
    bootstrap,
    injectorAware, aliasFactoryMap, aliasMap
} from './lib/decorators'
