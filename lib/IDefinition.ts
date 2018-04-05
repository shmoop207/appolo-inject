import {Injector} from "./inject";

export interface IParamInject{
    value?:any,
    ref?:string,
    name?:string,
    key?:string,
    indexBy?:string,
    aliasFactory?:string,
    alias?:string,
    array?:IParamInject[],
    dictionary?:IParamInject[],
    factory?:string,
    factoryMethod?:string,
    objectProperty?:{
        object:string,
        property:string
    }


}

export interface IDefinition{
    path?:string
    id?:string
    type?:Function
    args?:IParamInject[]
    singleton?:boolean
    factory?:boolean
    lazy?:boolean
    aliasFactory?:string[]
    alias?:string[]
    initMethod?:string
    injector?:Injector;
    $isWired?:boolean
    $isFactoryWired?:boolean
    //$hasFactory?:boolean
    //$sameNameFactory?:boolean
    //$propertiesGenerated?:boolean
    properties?:IParamInject[]
    props?:IParamInject[]
    inject?:IParamInject[]
    injectorAware?:boolean
}