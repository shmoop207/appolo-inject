"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const ioc = require("../lib/inject");
let should = chai.should();
describe('Injector Aware', function () {
    describe('should inject injector to object', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    injectorAware: true
                }
            });
            injector.initialize();
        });
        it('should have the injected value', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.$injector);
            rectangle.$injector.should.be.equal(injector);
        });
    });
});
//# sourceMappingURL=aware.js.map