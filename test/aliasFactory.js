"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Alias Factory', function () {
    describe('should inject alias factory', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                constructor(num) {
                    this.num = num || 25;
                }
                calc() {
                    return this.num;
                }
            };
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [
                        {
                            name: 'calcable',
                            aliasFactory: 'calcable'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    aliasFactory: ['calcable'],
                    singleton: false
                }
            });
            await injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0]();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
        it('should inject property with run time params', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0](30);
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(30);
        });
    });
    describe('should inject alias factory link', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                constructor(num) {
                    this.num = num || 25;
                }
                calc() {
                    return this.num;
                }
            };
            injector.register('rectangle', Rectangle)
                .singleton()
                .injectAliasFactory('calcable', 'calcable');
            injector.register('calcManager', CalcManager).aliasFactory(['calcable']);
            await injector.initialize();
        });
        it('should inject property ', function () {
            var rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0]();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
        it('should inject property with run time params', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0](30);
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(30);
        });
    });
    describe('should inject alias factory link indexBy', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                constructor(num) {
                    this.num = num || 25;
                }
                static get NAME() {
                    return "test";
                }
                calc() {
                    return this.num;
                }
            };
            injector.register('rectangle', Rectangle).singleton().injectAliasFactory('calcable', 'calcable', "NAME");
            injector.register('calcManager', CalcManager).aliasFactory(['calcable']);
            await injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Object);
            let calcable = rectangle.calcable.test();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
    });
    describe('inject factory alias with dynamic factory', function () {
        let injector, FooManager;
        it('should inject factory alias with dynamic factory', async function () {
            injector = ioc.createContainer();
            let BooManager = class BooManager {
                constructor(name2) {
                    this.name2 = name2;
                }
            };
            BooManager = tslib_1.__decorate([
                decorators_1.define()
            ], BooManager);
            let FooManager = class FooManager {
                constructor(name) {
                    this.name = name;
                }
                get() {
                    return this.createFooManager(this.name);
                }
            };
            tslib_1.__decorate([
                decorators_1.injectFactoryMethod(BooManager)
            ], FooManager.prototype, "createFooManager", void 0);
            FooManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.dynamicFactory(),
                decorators_1.aliasFactory("test")
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager[0](name).name2;
                }
            };
            tslib_1.__decorate([
                decorators_1.injectAliasFactory("test")
            ], Rectangle.prototype, "createFooManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define()
            ], Rectangle);
            injector.registerMulti([FooManager, Rectangle, BooManager]);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Array');
            rectangle.createFooManager.length.should.eq(1);
            rectangle.createFooManager[0]("boo").should.be.instanceof(BooManager);
            rectangle.getName("boo").should.be.eq("boo");
        });
    });
});
//# sourceMappingURL=aliasFactory.js.map