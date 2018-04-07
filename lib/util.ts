import _ = require('lodash');
import {InjectDefinitionsSymbol} from "./decorators";

export class Util {
    public static getClassName(fn: Function): string {
        return fn.name.charAt(0).toLowerCase() + fn.name.slice(1)
    }

    public static getClassNameOrId(objectId: string | Function): string {
        if (_.isFunction(objectId)) {
            objectId = Util.getClassName(objectId);
        }


        return objectId as string;
    }

    public static getFunctionArgs(func: (...args: any[]) => any) {

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

    public static getReflectData<T>(symbol: Symbol, klass, defaultValue: T): T {
        let value = Reflect.getOwnMetadata(symbol, klass);

        if (!value && Reflect.hasMetadata(symbol, klass)) {
            value = _.cloneDeep(Reflect.getMetadata(symbol, klass));
            Reflect.defineMetadata(symbol, value, klass);
        }

        if (!value) {
            value = defaultValue;
            Reflect.defineMetadata(InjectDefinitionsSymbol, value, klass);
        }

        return value
    }

    public static mapPush(map: { [index: string]: Object[] }, key: string, obj: Object): void {
        (!map[key]) && (map[key] = []);

        map[key].push(obj)
    }

    public static createDelegate(fn: Function, obj: any, args: any[]): Function {
        return function () {

            let callArgs = (args || []).concat(arguments);

            return fn.apply(obj, callArgs);
        };
    }
}