"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
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
}
exports.Util = Util;
//# sourceMappingURL=util.js.map