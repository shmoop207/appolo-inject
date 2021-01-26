import {Injector} from "../../inject/inject";

export function _defineProperty(this: Injector, object: any, name: string, fn: Function, cache: boolean = false,addSelf = false) {
    let $self = this;
    if (!cache) {
        Object.defineProperty(object, name, {
            get() {
                return addSelf ?fn($self):fn();
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

            let value = addSelf ?fn($self):fn();

            func.__cached__[name] = value;

            return value;
        }, configurable: true
    });
}
