"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../");
const __1 = require("../");
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
                static get NAME() {
                    return "test";
                }
                constructor(num) {
                    this.num = num || 25;
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
                (0, __1.define)()
            ], BooManager);
            let FooManager = class FooManager {
                constructor(name) {
                    this.name = name;
                }
                async get() {
                    return this.createFooManager(this.name);
                }
            };
            tslib_1.__decorate([
                (0, __1.factoryMethod)(BooManager)
            ], FooManager.prototype, "createFooManager", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.dynamicFactory)(),
                (0, __1.aliasFactory)("test")
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
                async getName(name) {
                    let a = await this.createFooManager[0](name);
                    return a.name2;
                }
            };
            tslib_1.__decorate([
                (0, __1.aliasFactory)("test")
            ], Rectangle.prototype, "createFooManager", void 0);
            tslib_1.__decorate([
                (0, __1.aliasFactoryMap)("test", (item) => item.name)
            ], Rectangle.prototype, "createFooManagerMap", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)()
            ], Rectangle);
            injector.registerMulti([FooManager, Rectangle, BooManager]);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Array');
            rectangle.createFooManager.length.should.eq(1);
            //rectangle.createFooManager[0]("boo").should.be.instanceof(BooManager);
            let a = await rectangle.getName("boo");
            a.should.be.eq("boo");
            rectangle.createFooManagerMap.should.be.instanceOf(Map);
            let result = await rectangle.createFooManagerMap.get("FooManager")("boo");
            result.name2.should.be.eq("boo");
        });
    });
});
//# sourceMappingURL=aliasFactory.js.map