"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._defineProperty = void 0;
function _defineProperty(object, name, fn, cache = false) {
    let $self = this;
    if (!cache) {
        Object.defineProperty(object, name, {
            get() {
                return fn($self);
            }, configurable: true
        });
        return;
    }
    let func = fn;
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
exports._defineProperty = _defineProperty;
//# sourceMappingURL=_defineProperty.js.map