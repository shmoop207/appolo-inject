import {Injector} from "../inject/inject";

export type Class = { new(...args: any[]): any; };


export interface IParamInject {
    value?: any,
    ref?: string,
    name?: string,
    key?: string,
    indexBy?: string| { type: "map"|"object", index: string },
    aliasFactory?: string,
    alias?: string | Class,
    array?: IParamInject[],
    dictionary?: IParamInject[],
    factory?: { id: string, injector?: Injector },
    factoryMethod?: string,
    factoryMethodAsync?: string,
    parent?: Class
    lazy?: true
    lazyFn?: Function
    injector?: Injector,
    objectProperty?: {
        object: string,
        property: string
    }


}

export interface IDefinition {
    path?: string
    id?: string
    refName?: string
    type?: Function
    args?: IParamInject[]
    singleton?: boolean
    factory?: boolean
    lazy?: boolean
    lazyFn?: Function
    dynamicFactory?: boolean
    override?: boolean
    aliasFactory?: string[]
    alias?: (string | Class)[]
    initMethod?: string
    bootstrapMethod?: string
    bootstrapMethodAsync?: string
    initMethodAsync?: string
    injector?: Injector;
    //$isWired?: boolean
    //$isFactoryWired?: boolean
    //properties?: IParamInject[]
    //props?: IParamInject[]
    inject?: IParamInject[]
    injectorAware?: boolean
    customParams?: { [index: string]: any[] }
}

