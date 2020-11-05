import {IParamInject} from "../../interfaces/IDefinition";
import {Injector} from "../../inject/inject";

export function _getByParamObj(this: Injector, propObj: IParamInject, ref: string, args?: any[]) {
    return propObj.injector && propObj.injector !== this ? propObj.injector._get(ref, args) : this._get(ref, args)
}
