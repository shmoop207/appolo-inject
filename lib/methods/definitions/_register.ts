import {Class} from "../../interfaces/IDefinition";
import {Define} from "../../define/define";
import {Util} from "../../utils/util";
import {InjectDefineSymbol} from "../../decorators/decorators";
import {Injector} from "../../inject/inject";

export function _register(this: Injector, id: string | Class, type?: Class, filePath?: string): Define {

    if (Util.isFunction(id)) {
        type = id as Class;
        id = Util.getClassName(type);
    }

    let define: Define = type
        ? (Reflect.getMetadata(InjectDefineSymbol, type) || new Define(id as string, type))
        : new Define(id as string);

    define = define.clone();
    define.path(filePath);
    define.injector(this);

    this.addDefinition(define.definition.id || id as string, define.definition);

    return define;
}
