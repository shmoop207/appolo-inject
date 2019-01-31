"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ioc = require("../lib/inject");
const chai = require("chai");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Lazy', function () {
    describe('inject lazy fn', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            let Test = class Test {
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test.prototype, "testLazy", void 0);
            Test = tslib_1.__decorate([
                decorators_1.define()
            ], Test);
            injector.register('test', Test);
            injector.addDefinition("testLazy", {
                lazyFn: () => {
                    return "working";
                }
            });
            injector.initialize();
        });
        it('should inject lazy fn', function () {
            let test = injector.getObject('test');
            test.testLazy.should.be.eq("working");
        });
    });
    describe('create lazy object', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            }
            injector.register('rectangle', Rectangle).singleton().lazy();
            injector.initialize();
        });
        it('should not exist instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });
        it('should created lazy', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
        it('should created lazy once', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
            let r = rectangle.number;
            let r2 = injector.getObject('rectangle').number;
            r.should.be.eq(r2);
        });
    });
});
//# sourceMappingURL=lazy.js.map