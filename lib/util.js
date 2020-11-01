"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const decorators_1 = require("./decorators");
class Util {
    static getClassName(fn) {
        return fn.name.charAt(0).toLowerCase() + fn.name.slice(1);
    }
    static isUndefined(value) {
        return typeof value === 'undefined';
    }
    static isObject(val) {
        if (val === null) {
            return false;
        }
        return ((typeof val === 'function') || (typeof val === 'object'));
    }
    static isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    ;
    static getClassNameOrId(objectId) {
        if (Util.isFunction(objectId)) {
            objectId = Util.getClassName(objectId);
        }
        return objectId;
    }
    static isClass(v) {
        return typeof v === 'function' && v.name && /^\s*class\s+/.test(v.toString());
    }
    static getClassDefinition(fn) {
        return Util.getReflectData(decorators_1.InjectDefineSymbol, fn);
    }
    static isString(str) {
        return (typeof str === 'string' || str instanceof String);
    }
    static keyBy(arr, key) {
        let output = {};
        for (let i = 0, len = (arr || []).length; i < len; i++) {
            let item = arr[i];
            let outputKey = Util.isFunction(key) ? key(item, i) : item[key];
            output[outputKey] = item;
        }
        return output;
    }
    static keyByMap(arr, key) {
        let output = new Map();
        for (let i = 0, len = (arr || []).length; i < len; i++) {
            let item = arr[i];
            let outputKey = Util.isFunction(key) ? key(item, i) : item[key];
            output.set(outputKey, item);
        }
        return output;
    }
    static removeFromArray(list, item) {
        if (!list || !list.length) {
            return;
        }
        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i] === item) {
                list.splice(i, 1);
            }
        }
    }
    static groupByArray(arr, key) {
        let output = {};
        for (let i = 0, len = arr.length; i < len; i++) {
            let item = arr[i], value = (typeof key === "function") ? key(item) : item[key], dto = output[value] || (output[value] = []);
            dto.push(item);
        }
        return output;
    }
    static getClassId(fn) {
        if (!fn) {
            return null;
        }
        if (Util.isString(fn)) {
            return fn;
        }
        let define = Util.getClassDefinition(fn);
        if (define) {
            return define.definition.id;
        }
        if (Util.isClass(fn)) {
            return Util.getClassName(fn);
        }
        return null;
    }
    static getFunctionArgs(func) {
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const ARGUMENT_NAMES = /([^\s,]+)/g;
        let fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let args = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (args === null) {
            args = [];
        }
        args = Util.compactArray(args);
        return args;
    }
    static compactArray(array) {
        let index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
        while (++index < length) {
            let value = array[index];
            if (value) {
                result[resIndex++] = value;
            }
        }
        return result;
    }
    static getReflectData(symbol, klass, defaultValue) {
        let value = Reflect.getOwnMetadata(symbol, klass);
        if (!value && Reflect.hasMetadata(symbol, klass)) {
            value = Util.cloneDeep(Reflect.getMetadata(symbol, klass));
            Reflect.defineMetadata(symbol, value, klass);
        }
        if (!value && defaultValue != undefined) {
            value = defaultValue;
            Reflect.defineMetadata(symbol, value, klass);
        }
        return value;
    }
    static cloneDeep(obj) {
        if (!obj) {
            return;
        }
        let output = Array.isArray(obj) ? [] : {};
        let keys = Object.keys(obj);
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i], value = obj[key];
            output[key] = (value == null || typeof value != "object") ? value : Util.cloneDeep(value);
        }
        return output;
    }
    static mapPush(map, key, obj) {
        (!map[key]) && (map[key] = []);
        map[key].push(obj);
    }
    static createDelegate(fn, obj, args) {
        return function () {
            let callArgs = (args || []).concat(arguments);
            return fn.apply(obj, callArgs);
        };
    }
    static regroupByParallel(arr, fn) {
        let output = [];
        for (let i = 0, len = arr ? arr.length : 0; i < len; i++) {
            let item = arr[i], lastItemArr = output[output.length - 1];
            if (fn(item) && lastItemArr && lastItemArr.length && fn(lastItemArr[0])) {
                lastItemArr.push(item);
            }
            else {
                output.push([item]);
            }
        }
        return output;
    }
    static async runRegroupByParallel(arr, fn, runFn) {
        let itemsArr = Util.regroupByParallel(arr, fn);
        for (let i = 0, len = (itemsArr || []).length; i < len; i++) {
            let items = itemsArr[i];
            let promises = (items || []).map(item => runFn(item));
            await Promise.all(promises);
        }
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map