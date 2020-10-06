"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const index_1 = require("@appolo/events/index");
class Events {
    constructor() {
        this.instanceOwnInitialized = new index_1.Event();
        this.instanceInitialized = new index_1.Event();
        this.instanceOwnCreated = new index_1.Event();
        this.instanceCreated = new index_1.Event();
        this.beforeInitialize = new index_1.Event();
        this.afterInitialize = new index_1.Event();
    }
}
exports.Events = Events;
//# sourceMappingURL=events.js.map