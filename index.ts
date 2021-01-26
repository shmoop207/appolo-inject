import {Injector} from "./lib/inject/inject";

export default require('./lib/inject/inject');
export {IDefinition, IParamInject} from './lib/interfaces/IDefinition'
export {IFactory,FactoryFn} from './lib/interfaces/IFactory'
export {IOptions} from './lib/interfaces/IOptions'
export {Injector} from './lib/inject/inject'
export {Define} from './lib/define/define'
export {Util} from './lib/utils/util'
export {singleton} from './lib/decorators/singleton'
export {define} from './lib/decorators/define'
export {inject} from './lib/decorators/inject'
export {factoryMethod} from './lib/decorators/factoryMethod'
export {init} from './lib/decorators/init'
export {array} from './lib/decorators/array'
export {dictionary} from './lib/decorators/dictionary'
export {factory} from './lib/decorators/factory'
export {objectProperty} from './lib/decorators/objectProperty'
export {value} from './lib/decorators/value'
export {aliasFactory} from './lib/decorators/aliasFactory'
export {alias} from './lib/decorators/alias'
export {lazy} from './lib/decorators/lazy'
export {override} from './lib/decorators/override'
export {dynamicFactory} from './lib/decorators/dynamicFactory'
export {customFn} from './lib/decorators/customFn'
export {initAsync} from './lib/decorators/initAsync'
export {customParam} from './lib/decorators/customParam'
export {factoryMethodAsync} from './lib/decorators/factoryMethodAsync'
export {bootstrapAsync} from './lib/decorators/bootstrapAsync'
export {bootstrap} from './lib/decorators/bootstrap'
export {injectorAware} from './lib/decorators/injectorAware'
export {aliasFactoryMap} from './lib/decorators/aliasFactoryMap'
export {aliasMap} from './lib/decorators/aliasMap'
export {InjectDefineSymbol} from './lib/decorators/decorators'


export let createContainer = function (): Injector {
    return new Injector();
};
