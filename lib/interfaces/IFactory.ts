export interface IFactory<T> {
    get(): T | Promise<T>
}