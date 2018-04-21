"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Decorators', function () {
    describe('should inject with inject params name', function () {
        let injector;
        let Test = class Test {
            name() {
                return "test";
            }
        };
        Test = tslib_1.__decorate([
            decorators_1.define()
        ], Test);
        let Test2 = class Test2 {
            constructor(test1) {
                this.test1 = test1;
            }
        };
        Test2 = tslib_1.__decorate([
            decorators_1.define(),
            tslib_1.__param(0, decorators_1.injectParam("test"))
        ], Test2);
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in constructor", () => {
            injector.register(Test);
            injector.register(Test2);
            injector.initialize();
            let test2 = injector.getObject("test2");
            test2.test1.name().should.be.eq("test");
        });
    });
    describe('should inject with inject params constructor', function () {
        let injector;
        let Test = class Test {
            name() {
                return "test";
            }
        };
        Test = tslib_1.__decorate([
            decorators_1.define()
        ], Test);
        let Test2 = class Test2 {
            constructor(test) {
                this.test = test;
            }
        };
        Test2 = tslib_1.__decorate([
            decorators_1.define(),
            tslib_1.__param(0, decorators_1.injectParam())
        ], Test2);
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in constructor", () => {
            injector.register(Test);
            injector.register(Test2);
            injector.initialize();
            let test2 = injector.getObject("test2");
            test2.test.name().should.be.eq("test");
        });
    });
    describe('should inject with inject params method', function () {
        let injector;
        let Test = class Test {
            name() {
                return "test";
            }
        };
        Test = tslib_1.__decorate([
            decorators_1.define()
        ], Test);
        let Test2 = class Test2 {
            constructor() { }
            test(test) {
                return test.name();
            }
        };
        tslib_1.__decorate([
            tslib_1.__param(0, decorators_1.injectParam())
        ], Test2.prototype, "test", null);
        Test2 = tslib_1.__decorate([
            decorators_1.define()
        ], Test2);
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in method", () => {
            injector.register(Test);
            injector.register(Test2);
            injector.initialize();
            let test2 = injector.getObject("test2");
            test2.test().should.be.eq("test");
        });
    });
    describe('should inject with decorators', function () {
        let injector, CalcManager, FooManager, Rectangle, Cleanable;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
            };
            tslib_1.__decorate([
                decorators_1.injectAlias('calcable')
            ], Rectangle.prototype, "calcable", void 0);
            tslib_1.__decorate([
                decorators_1.injectAlias('cleanable')
            ], Rectangle.prototype, "cleanable", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            let CalcManager = class CalcManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
            };
            CalcManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.alias('calcable')
            ], CalcManager);
            let FooManager = class FooManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
                cleanable() {
                }
            };
            FooManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.alias('calcable'),
                decorators_1.alias('cleanable')
            ], FooManager);
            let BarManager = class BarManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
                cleanable() {
                }
            };
            BarManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.alias('calcable')
            ], BarManager);
            injector.register(Rectangle);
            injector.register(CalcManager);
            injector.register(BarManager);
            injector.register(FooManager);
            await injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);
        });
    });
});
//# sourceMappingURL=decorators.js.map