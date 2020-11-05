import {Injector} from "../../inject/inject";

export function _defineProperty(this: Injector, object: any, name: string, fn: Function, cache: boolean = false) {
    let $self = this;
    if (!cache) {
        Object.defineProperty(object, name, {
            get() {
                return fn($self);
            }, configurable: true
        });

        return;
    }


    let func = fn as any;
    func.__cached__ = {};

    Object.defineProperty(object, name, {

        get() {

            let cached = func.__cached__[name];

            if (cached) {
                return cached;
            }

            let value = fn($self);

            func.__cached__[name] = value;

            return value;
        }, configurable: true
    });
}
