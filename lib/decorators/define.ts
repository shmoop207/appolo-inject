import {Define} from "../define/define";
import {Util} from "../utils/util";
import {Class} from "../interfaces/IDefinition";
import {InjectDefineSymbol, InjectDefinitionsSymbol} from "./decorators";

export function define(id?: string): (fn: Function) => void {
    return function (id: string, fn: Function) {

        let define = new Define(id || Util.getClassName(fn), fn as Class);

        (Reflect.getMetadata(InjectDefinitionsSymbol, fn) || []).forEach((item: { name: string, args: any[] }) => define[item.name].apply(define, item.args));

        Reflect.defineMetadata(InjectDefineSymbol, define, fn);

    }.bind(null, id);
}
