"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const decorators_1 = require("./decorators");
class Util {
    static getClassName(fn) {
        return fn.name.charAt(0).toLowerCase() + fn.name.slice(1);
    }
    static getClassNameOrId(objectId) {
        if (_.isFunction(objectId)) {
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
    static getClassId(fn) {
        if (!fn) {
            return null;
        }
        if (_.isString(fn)) {
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
        args = _.compact(args);
        return args;
    }
    static getReflectData(symbol, klass, defaultValue) {
        let value = Reflect.getOwnMetadata(symbol, klass);
        if (!value && Reflect.hasMetadata(symbol, klass)) {
            value = _.cloneDeep(Reflect.getMetadata(symbol, klass));
            Reflect.defineMetadata(symbol, value, klass);
        }
        if (!value && defaultValue != undefined) {
            value = defaultValue;
            Reflect.defineMetadata(symbol, value, klass);
        }
        return value;
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
        for (let items of itemsArr) {
            let promises = _.map(items, item => runFn(item));
            await Promise.all(promises);
        }
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map