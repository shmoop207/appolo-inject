"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("..");
const __1 = require("../");
let should = chai.should();
describe('Decorators', function () {
    describe('should inject with inject params name', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in constructor", () => {
            let Test = class Test {
                name() {
                    return "test";
                }
            };
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            let Test2 = class Test2 {
                constructor(test1) {
                    this.test1 = test1;
                }
            };
            Test2 = tslib_1.__decorate([
                __1.define(),
                tslib_1.__param(0, __1.inject("test"))
            ], Test2);
            injector.register(Test);
            injector.register(Test2);
            injector.initialize();
            let test2 = injector.getObject("test2");
            test2.test1.name().should.be.eq("test");
        });
    });
    describe('should inject with inject params constructor', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in constructor", () => {
            let Test = class Test {
                name() {
                    return "test";
                }
            };
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            let Test2 = class Test2 {
                constructor(test) {
                    this.test = test;
                }
            };
            Test2 = tslib_1.__decorate([
                __1.define(),
                tslib_1.__param(0, __1.inject())
            ], Test2);
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
            __1.define()
        ], Test);
        let Test2 = class Test2 {
            constructor() { }
            test(test) {
                return test.name();
            }
        };
        tslib_1.__decorate([
            tslib_1.__param(0, __1.inject())
        ], Test2.prototype, "test", null);
        Test2 = tslib_1.__decorate([
            __1.define()
        ], Test2);
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it("should have inject params in method", async () => {
            injector.register(Test);
            injector.register(Test2);
            await injector.initialize();
            let test2 = injector.getObject("test2");
            test2.test().should.be.eq("test");
        });
    });
    describe('should inject with decorators', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
            };
            tslib_1.__decorate([
                __1.alias('calcable')
            ], Rectangle.prototype, "calcable", void 0);
            tslib_1.__decorate([
                __1.alias('cleanable')
            ], Rectangle.prototype, "cleanable", void 0);
            tslib_1.__decorate([
                __1.aliasMap('calcable', (item) => item.constructor.name)
            ], Rectangle.prototype, "cleanableMap", void 0);
            Rectangle = tslib_1.__decorate([
                __1.define(),
                __1.singleton()
            ], Rectangle);
            let CalcManager = class CalcManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
            };
            CalcManager = tslib_1.__decorate([
                __1.define(),
                __1.singleton(),
                __1.alias('calcable')
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
                __1.define(),
                __1.singleton(),
                __1.alias('calcable'),
                __1.alias('cleanable')
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
                __1.define(),
                __1.singleton(),
                __1.alias('calcable')
            ], BarManager);
            injector.register(Rectangle);
            injector.register(CalcManager);
            injector.register(BarManager);
            injector.register(FooManager);
            await injector.initialize();
        });
        it('should inject alias property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);
            rectangle.cleanableMap.size.should.be.equal(3);
            rectangle.cleanableMap.should.be.instanceOf(Map);
            rectangle.cleanableMap.get("FooManager").constructor.name.should.be.eq("FooManager");
        });
    });
    describe('should inject with lazy', function () {
        let injector, CalcManager, FooManager, Rectangle, Cleanable;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let FooManager = class FooManager {
                get name() {
                    return this.constructor.name;
                }
            };
            FooManager = tslib_1.__decorate([
                __1.define(),
                __1.singleton()
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
            };
            tslib_1.__decorate([
                __1.lazy()
            ], Rectangle.prototype, "fooManager", void 0);
            tslib_1.__decorate([
                __1.lazy("someName")
            ], Rectangle.prototype, "fooManager2", void 0);
            Rectangle = tslib_1.__decorate([
                __1.define(),
                __1.singleton()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            injector.addObject("fooManager", new FooManager());
            injector.addObject("someName", new FooManager());
        });
        it('should inject property with lazy ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            should.exist(rectangle.fooManager2);
            rectangle.fooManager2.name.should.be.eq("FooManager");
        });
    });
    describe('should inject with lazy inject the same instance', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let FooManager = class FooManager {
                get name() {
                    return this.constructor.name;
                }
            };
            FooManager = tslib_1.__decorate([
                __1.define()
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
            };
            tslib_1.__decorate([
                __1.lazy()
            ], Rectangle.prototype, "fooManager", void 0);
            Rectangle = tslib_1.__decorate([
                __1.define(),
                __1.singleton()
            ], Rectangle);
            injector.register(Rectangle);
            injector.register(FooManager);
            await injector.initialize();
        });
        it('should inject property with lazy ', function () {
            let rectangle = injector.getObject('rectangle');
            (rectangle.fooManager === rectangle.fooManager).should.be.ok;
        });
    });
});
//# sourceMappingURL=decorators.js.map