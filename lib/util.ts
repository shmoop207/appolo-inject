import _ = require('lodash');
import {InjectDefineSymbol} from "./decorators";
import {Define} from "./define";

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

    public static isClass(v: any): boolean {
        return typeof v === 'function' && v.name && /^\s*class\s+/.test(v.toString());
    }

    public static getClassDefinition(fn: any): Define {
        return Util.getReflectData<Define>(InjectDefineSymbol, fn)
    }

    public static getClassId(fn: any): string {

        if (!fn) {
            return null;
        }

        if (_.isString(fn)) {
            return fn
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

    public static getReflectData<T>(symbol: Symbol | string, klass, defaultValue?: T): T {
        let value = Reflect.getOwnMetadata(symbol, klass);

        if (!value && Reflect.hasMetadata(symbol, klass)) {
            value = _.cloneDeep(Reflect.getMetadata(symbol, klass));
            Reflect.defineMetadata(symbol, value, klass);
        }

        if (!value && defaultValue != undefined) {
            value = defaultValue;
            Reflect.defineMetadata(symbol, value, klass);
        }

        return value
    }

    public static mapPush(map: { [index: string]: Object[] }, key: string, obj: Object): void {
        (!map[key]) && (map[key] = []);

        map[key].push(obj);
    }

    public static createDelegate(fn: Function, obj: any, args: any[]): Function {
        return function () {

            let callArgs = (args || []).concat(arguments);

            return fn.apply(obj, callArgs);
        };
    }

    public static regroupByParallel<T>(arr: T[], fn: (item: T) => boolean): T[][] {
        let output: T[][] = [];

        for (let i = 0, len = arr ? arr.length : 0; i < len; i++) {
            let item = arr[i], lastItemArr = output[output.length - 1];

            if (fn(item) && lastItemArr && lastItemArr.length && fn(lastItemArr[0])) {

                lastItemArr.push(item)

            } else {
                output.push([item])
            }
        }

        return output;
    }

    public static async runRegroupByParallel<T>(arr: T[], fn: (item: T) => boolean, runFn: (item: T) => Promise<any>): Promise<void> {
        let itemsArr = Util.regroupByParallel(arr, fn);

        for (let items of itemsArr) {

            let promises = _.map(items, item => runFn(item));

            await Promise.all(promises)
        }
    }
}