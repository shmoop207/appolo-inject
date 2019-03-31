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
    injectParam,
    singleton,
    inject,
    injectAliasFactory,
    injectAlias,
    injectFactoryMethod,
    initMethod,
    injectArray,
    injectDictionary,
    injectFactory,
    injectObjectProperty,
    injectValue,
    aliasFactory,
    alias,
    lazy,
    factory,
    override, injectLazy, dynamicFactory
} from './lib/decorators'
