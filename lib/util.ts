import {InjectDefineSymbol} from "./decorators";
import {Define} from "./define";

export class Util {
    public static getClassName(fn: Function): string {
        return fn.name.charAt(0).toLowerCase() + fn.name.slice(1)
    }

    public static isUndefined(value: any): boolean {
        return typeof value === 'undefined'
    }

    public static isObject(val: any): boolean {
        if (val === null) {
            return false;
        }
        return ((typeof val === 'function') || (typeof val === 'object'));
    }

    public static isFunction(obj: any): boolean {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    };

    public static getClassNameOrId(objectId: string | Function): string {
        if (Util.isFunction(objectId)) {
            objectId = Util.getClassName(objectId as Function);
        }

        return objectId as string;
    }

    public static isClass(v: any): boolean {
        return typeof v === 'function' && v.name && /^\s*class\s+/.test(v.toString());
    }

    public static getClassDefinition(fn: any): Define {
        return Util.getReflectData<Define>(InjectDefineSymbol, fn)
    }

    public static isString(str: any): boolean {
        return (typeof str === 'string' || str instanceof String);
    }

    public static keyBy<T extends object>(arr: T[], key: string | ((item: T, index: number) => string)) {

        let output: { [index: string]: T } = {};

        for (let i = 0, len = (arr || []).length; i < len; i++) {

            let item: any = arr[i];

            let outputKey = Util.isFunction(key) ? (key as Function)(item, i) : item[key as string];

            output[outputKey] = item;
        }

        return output;
    }

    public static keyByMap<T extends object,K extends any=string>(arr: T[], key: string | ((item: T, index: number) => string)):Map<K,T> {

        let output = new Map<K,T>()

        for (let i = 0, len = (arr || []).length; i < len; i++) {

            let item: any = arr[i];

            let outputKey = Util.isFunction(key) ? (key as Function)(item, i) : item[key as string];

            output.set(outputKey,item)
        }

        return output;
    }

    public static removeFromArray<T>(list: T[], item: T): void {

        if (!list || !list.length) {
            return;
        }

        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i] === item) {
                list.splice(i, 1);
            }
        }
    }

    public static groupByArray<T>(arr: T[], key: string | number | ((item: T) => string | number)): { [index: string]: T[] } {

        let output: { [index: string]: T[] } = {};

        for (let i = 0, len = arr.length; i < len; i++) {
            let item = arr[i],
                value = (typeof key === "function") ? key(item) : item[key],
                dto = output[value] || (output[value] = []);

            dto.push(item);
        }

        return output;
    }

    public static getClassId(fn: any): string {

        if (!fn) {
            return null;
        }

        if (Util.isString(fn)) {
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

        args = Util.compactArray(args);

        return args;
    }

    public static compactArray<T>(array: T[]): T[] {
        let index = -1,
            length = array == null ? 0 : array.length,
            resIndex = 0,
            result = [];

        while (++index < length) {
            let value = array[index];
            if (value) {
                result[resIndex++] = value;
            }
        }
        return result;
    }

    public static getReflectData<T>(symbol: Symbol | string, klass, defaultValue?: T): T {
        let value = Reflect.getOwnMetadata(symbol, klass);

        if (!value && Reflect.hasMetadata(symbol, klass)) {
            value = Util.cloneDeep(Reflect.getMetadata(symbol, klass));
            Reflect.defineMetadata(symbol, value, klass);
        }

        if (!value && defaultValue != undefined) {
            value = defaultValue;
            Reflect.defineMetadata(symbol, value, klass);
        }

        return value
    }

    public static cloneDeep<T>(obj: T): T {

        if (!obj) {
            return;
        }

        let output = Array.isArray(obj) ? [] : {};

        let keys = Object.keys(obj);

        for (let i = 0, len = keys.length; i < len; i++) {

            let key = keys[i], value = obj[key];
            output[key] = (value == null || typeof value != "object") ? value : Util.cloneDeep(value)
        }

        return output as any;
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

        for (let i = 0, len = (itemsArr || []).length; i < len; i++) {
            let items = itemsArr[i];

            let promises = (items || []).map(item => runFn(item));

            await Promise.all(promises)
        }
    }
}
