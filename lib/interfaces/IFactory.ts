export interface IFactory<T> {
    get(): T | Promise<T>
}

export type FactoryFn<T extends new (...args: any) => any> = (...args: ConstructorParameters<T>) => InstanceType<T>
