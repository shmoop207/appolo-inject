"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Benchmark = require("benchmark");
const inject = require("../");
let suite = new Benchmark.Suite();
let injector = inject.createContainer();
class Rectangle {
    constructor() {
        this.number = Math.random();
    }
    area() {
        return 25;
    }
}
injector.addDefinitions({
    rectangle: {
        type: Rectangle,
        singleton: true
    },
    rectangle2: {
        type: Rectangle,
        singleton: false
    }
});
injector.initialize();
suite.add("get object singleton", () => {
    let req1 = injector.getObject('rectangle');
});
suite.add("get object singleton ignore factory", () => {
    let req1 = injector.getObject('rectangle', []);
});
suite.add("get object not singleton", () => {
    let req1 = injector.getObject('rectangle2', []);
});
suite.on('cycle', (event) => {
    console.log(String(event.target));
});
suite.run();
//# sourceMappingURL=benchmark.js.map