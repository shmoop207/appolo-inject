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
    type?:Function
    args?:IParamInject[]
    singleton?:boolean
    lazy?:boolean
    aliasFactory?:string[]
    alias?:string[]
    initMethod?:string
    $isWired?:boolean
    $propertiesGenerated?:boolean
    properties?:IParamInject[]
    props?:IParamInject[]
    inject?:IParamInject[]
    injectorAware?:boolean
}