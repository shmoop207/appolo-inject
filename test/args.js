"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Constructor Args', function () {
    describe('inject value  to constructor', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor(size) {
                    this.size = size;
                }
                area() {
                    return this.size;
                }
            };
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    args: [{
                            value: 25
                        }]
                }
            });
            injector.initialize();
        });
        it('should have the injected value', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.size);
            rectangle.area().should.equal(25);
        });
    });
    describe('inject value  to constructor linq', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor(size) {
                    this.size = size;
                }
                area() {
                    return this.size;
                }
            };
            injector.register('rectangle', Rectangle).singleton().args({ value: 25 });
            injector.initialize();
        });
        it('should have the injected value', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.size);
            rectangle.area().should.equal(25);
        });
    });
    xdescribe('inject to constructor args', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
        });
        it('should have the injected constructor args ', function () {
            class Rectangle {
                constructor(fooManager) {
                    this.fooManager = fooManager;
                }
                area() {
                    return this.size;
                }
            }
            class FooManager {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
        });
        it('should have the injected constructor args link ', function () {
            class Rectangle {
                constructor(fooManager) {
                    this.fooManager = fooManager;
                }
                area() {
                    return this.size;
                }
            }
            class FooManager {
                constructor() {
                }
            }
            injector.register('rectangle', Rectangle).singleton(true);
            injector.register('fooManager', FooManager).singleton(true);
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
        });
        it('should not inject without constructor args ', function () {
            class Rectangle {
                area(fooManager) {
                    return this.size;
                }
            }
            class FooManager {
                constructor() {
                    throw new Error("aaa");
                }
            }
            injector.register('rectangle', Rectangle).singleton(true);
            injector.register('fooManager', FooManager);
            should.not.throw(() => {
                injector.initialize();
                let rectangle = injector.getObject('rectangle');
            });
        });
        it('should have the injected constructor singleton false ', function () {
            class Rectangle {
                constructor(fooManager) {
                    this.fooManager = fooManager;
                }
                area() {
                    return this.size;
                }
            }
            class FooManager {
                constructor(barManager) {
                    this.barManager = barManager;
                }
            }
            class BarManager {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                },
                fooManager: {
                    type: FooManager,
                    singleton: false
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.barManager.should.be.instanceof(BarManager);
        });
        it('should have the injected constructor Circular reference ', function () {
            class Rectangle {
                constructor(fooManager) {
                    this.fooManager = fooManager;
                }
                area() {
                    return this.size;
                }
            }
            class FooManager {
                constructor(barManager) {
                    this.barManager = barManager;
                }
            }
            class BarManager {
                constructor(rectangle) {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });
            (function () {
                injector.initialize();
            }).should.throw(/^Circular reference/);
        });
        it('should have the injected constructor args with runtime args ', function () {
            class Rectangle {
                constructor(fooManager, test) {
                    this.fooManager = fooManager;
                    this.test = test;
                }
                area() {
                    return this.size;
                }
            }
            class FooManager {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle', ['working']);
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.test.should.be.eq("working");
        });
    });
    describe('inject value  to constructor', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor(size, name) {
                    this.size = size;
                    this.name = name;
                }
                area() {
                    return this.size;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    args: [{
                            value: 25
                        }]
                }
            });
            injector.initialize();
        });
        it('should have the injected value null', function () {
            let rectangle = injector.getObject('rectangle', [null]);
            should.exist(rectangle.size);
            should.not.exist(rectangle.name);
            rectangle.area().should.equal(25);
        });
        it('should have the injected value and runtime value', function () {
            let rectangle = injector.getObject('rectangle', ['foo']);
            should.exist(rectangle.size);
            should.exist(rectangle.name);
            rectangle.area().should.equal(25);
            rectangle.name.should.equal('foo');
        });
    });
    describe('inject object  to constructor with runtime', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor(fooManager, name) {
                    this.fooManager = fooManager;
                    this.name = name + this.fooManager.name;
                }
            }
            class FooManager {
                constructor(name, barManager) {
                    this.barManager = barManager;
                    this.name = name + this.barManager.name;
                }
            }
            class BarManager {
                constructor(name) {
                    this.name = name;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    args: [{
                            ref: 'fooManager'
                        }]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true,
                    args: [{
                            value: 'foo'
                        }, {
                            ref: 'barManager'
                        }]
                },
                barManager: {
                    type: BarManager,
                    singleton: true,
                    args: [{
                            value: 'bar'
                        }]
                }
            });
            injector.initialize();
        });
        it('should inject to object runtime and ref objects', function () {
            let rectangle = injector.getObject('rectangle', ['rectangle']);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.fooManager.barManager);
            rectangle.name.should.equal('rectanglefoobar');
        });
    });
    describe('inject arg with inject params', function () {
        it("should injectParams by order", async function () {
            let AManager = class AManager {
            };
            AManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], AManager);
            let BManager = class BManager {
            };
            BManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], BManager);
            let CManager = class CManager {
                constructor(aManager, bManager) {
                    this.aManager = aManager;
                    this.bManager = bManager;
                }
            };
            CManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                tslib_1.__param(0, decorators_1.inject()), tslib_1.__param(1, decorators_1.inject())
            ], CManager);
            let injector = ioc.createContainer();
            injector.registerMulti([AManager, BManager, CManager]);
            await injector.initialize();
            let manager = injector.get(CManager);
            manager.aManager.should.be.instanceOf(AManager);
            manager.bManager.should.be.instanceOf(BManager);
        });
    });
});
//# sourceMappingURL=args.js.map