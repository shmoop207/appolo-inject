import {addDefinitionProperty} from "./decorators";

export function customFn(fn: Function) {

    return addDefinitionProperty("injectLazyFn", [fn], true);
}
