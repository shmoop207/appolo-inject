"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("..");
const sleep = require("sleep-promise");
const __1 = require("../");
let should = chai.should();
describe('Property Factory', function () {
    describe('inject factory Object', function () {
        let injector;
        it('should inject object after factory', async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.manager.name;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    return this.fooManager2;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [
                        {
                            name: 'manager',
                            factory: { id: 'fooManagerFactory' }
                        }
                    ]
                },
                fooManager2: {
                    type: FooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    factory: true,
                    singleton: true,
                    inject: [{ name: 'fooManager2', ref: "fooManager2" }]
                }
            });
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object linq', function () {
        let injector, FooManager;
        it('should inject object after factory', async function () {
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.manager.name;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    return this.fooManager2;
                }
            }
            injector = ioc.createContainer();
            injector.register('rectangle', Rectangle).singleton().injectFactory('manager', 'fooManagerFactory');
            injector.register('fooManager2', FooManager).singleton();
            injector.register('fooManagerFactory', FooManagerFactory).factory().singleton().inject('fooManager2');
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object with decorators', function () {
        let injector;
        it('should inject object after factory', async function () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.fooManager.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.factory)()
            ], Rectangle.prototype, "fooManager", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager2 = class FooManager2 {
                constructor() {
                    this.name = 'foo';
                }
            };
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooManager = class FooManager {
                constructor() {
                }
                get() {
                    this.fooManager2.name = this.fooManager2.name + "Factory";
                    return this.fooManager2;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooManager);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager2);
            injector.register(FooManager);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager2);
            rectangle.fooManager.name.should.be.eq("fooFactory");
        });
        it('should inject object after factory with inject and same name as factory', async function () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.fooManager.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "fooManager", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooManagerFactory = class FooManagerFactory {
                constructor() {
                }
                get() {
                    this.fooManager.name = this.fooManager.name + "Factory";
                    return this.fooManager;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManagerFactory.prototype, "fooManager", void 0);
            FooManagerFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooManagerFactory);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager);
            injector.register(FooManagerFactory);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.fooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.name.should.be.eq("fooFactory");
        });
        it('should inject object after factory with inject  factory different name', async function () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.barSomeName.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "barSomeName", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let BarSomeName = class BarSomeName {
                constructor() {
                }
                get() {
                    this.fooManager.name = this.fooManager.name + "Factory";
                    return this.fooManager;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BarSomeName.prototype, "fooManager", void 0);
            BarSomeName = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BarSomeName);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager);
            injector.register(BarSomeName);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            should.exist(rectangle.barSomeName);
            rectangle.barSomeName.should.be.instanceof(FooManager);
            rectangle.barSomeName.name.should.be.eq("fooFactory");
        });
        it('should inject multi factory', async function () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory1", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                get() {
                    return this.factory2 + "factory1";
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                get() {
                    return "factory2";
                }
            };
            Factory2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            injector.register(Factory2);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            //should.exist(rectangle.barSomeName);
            rectangle.getName().should.be.eq("factory2factory1");
        });
        // it.only('should inject multi factory async2', async ()=> {
        //     for(let i of  [100,10000,10]){
        //         await new Promise(resolve => {
        //             setTimeout(()=> resolve(),i)
        //         })
        //
        //         console.log(i)
        //     }
        // })
        it('should inject multi factory async', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory1", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return this.factory2 + "factory1";
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return "factory2";
                }
            };
            Factory2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            injector.register(Factory2);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory2factory1");
        });
        it('should inject multi factory async different containers', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory1", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return this.factory2 + "factory1";
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return "factory2";
                }
            };
            Factory2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", { injector: injector2 });
            await injector2.initialize();
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory2factory1");
        });
        it('should inject multi factory async parent container ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1 + this.factory2;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory1", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory2", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return "factory1";
                }
            };
            Factory1 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return this.factory1 + "factory2";
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Factory2.prototype, "factory1", void 0);
            Factory2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", { injector: injector2 });
            //injector.startInitialize()
            //injector2.startInitialize()
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory1factory1factory2");
        });
        it('should inject multi factory async multi child containers ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1 + this.fooManager.getName();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "factory1", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "fooManager", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                }
                getName() {
                    return this.factory1 + "FooManager";
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "factory1", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let Factory1 = class Factory1 {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return "factory1";
                }
            };
            Factory1 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Factory1);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            let injector2 = ioc.createContainer();
            injector2.register(FooManager);
            injector.addDefinition("fooManager", { injector: injector2 });
            let injector3 = ioc.createContainer();
            injector.addDefinition("factory1", { injector: injector3 });
            injector2.addDefinition("factory1", { injector: injector3 });
            injector3.register(Factory1);
            await injector3.initialize();
            await injector2.initialize();
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory1factory1FooManager");
        });
        it('should inject factory with same name child containers ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                get name() {
                    return this.fooManagerProvider[0].name + this.fooManagerProvider[1];
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "fooManagerProvider", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                    this.name = "FooManager";
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooManagerProvider = class FooManagerProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return [this.fooManager, "WithFactory"];
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManagerProvider.prototype, "fooManager", void 0);
            FooManagerProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooManagerProvider);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            let injector2 = ioc.createContainer();
            injector2.register(FooManager);
            injector2.register(FooManagerProvider);
            injector.addDefinition("fooManagerProvider", { injector: injector2 });
            //injector.addDefinition("fooManagerFactory", {injector: injector2,factory:true});
            injector2.parent = injector;
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("FooManagerWithFactory");
        });
        it('should inject factory with ref name ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                get name() {
                    return this.barManager[0].name + this.barManager[1];
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "barManager", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                    this.name = "FooManager";
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return [this.fooManager, "WithFactory"];
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooProvider.prototype, "fooManager", void 0);
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            let injector2 = ioc.createContainer();
            injector2.register(FooManager);
            injector2.register(FooProvider);
            injector.addDefinition("barManager", { injector: injector2, refName: "fooProvider" });
            injector2.parent = injector;
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("FooManagerWithFactory");
        });
        it('should inject factory with alias ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                get name() {
                    return this.fooProvider;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "fooProvider", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return this.fooManagers;
                }
            };
            tslib_1.__decorate([
                (0, __1.alias)("test")
            ], FooProvider.prototype, "fooManagers", void 0);
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            let FooManager = class FooManager {
                constructor() {
                    this.name = "FooManager";
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.alias)("test")
            ], FooManager);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooProvider);
            injector.register(FooManager);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.length.should.be.eq(1);
            rectangle.name[0].name.should.be.eq("FooManager");
        });
        it('should inject factory with alias nested ', async () => {
            let Rectangle = class Rectangle {
                constructor() {
                }
                get name() {
                    return this.fooProvider;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "fooProvider", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    return this.fooManagers[0].getName();
                }
            };
            tslib_1.__decorate([
                (0, __1.alias)("test")
            ], FooProvider.prototype, "fooManagers", void 0);
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            let FooManager = class FooManager {
                getName() {
                    return this.barManager.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "barManager", void 0);
            tslib_1.__decorate([
                (0, __1.init)()
            ], FooManager.prototype, "getName", null);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.alias)("test")
            ], FooManager);
            let BarManager = class BarManager {
                constructor() {
                    this.name = "BarManager";
                }
            };
            BarManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], BarManager);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooProvider);
            injector.register(FooManager);
            injector.register(BarManager);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("BarManager");
        });
        it('should inject factory with nested factory ref name', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    await sleep(10);
                    return this.fooManager.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooManager", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let FooManager = class FooManager {
                working() {
                    return this.fooProvider.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooProvider", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return { name: "working" };
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector.addDefinition("fooManager", { injector: injector2 });
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("working");
        });
        it('should inject factory with nested  get alias', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    return this.$injector.getAlias("aaa").concat(this.alias).map(item => item.working()).join(",");
                }
            };
            tslib_1.__decorate([
                (0, __1.alias)("aaa")
            ], BooFactory.prototype, "alias", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)(),
                (0, __1.injectorAware)()
            ], BooFactory);
            let FooManager = class FooManager {
                working() {
                    return "FooManager";
                }
            };
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.alias)("aaa")
            ], FooManager);
            let FooManager2 = class FooManager2 {
                working() {
                    return "FooManager2";
                }
            };
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.alias)("aaa")
            ], FooManager2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector.register(FooManager2);
            injector.register(FooManager);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("FooManager2,FooManager,FooManager2,FooManager");
        });
        it('should inject factory values to alias', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.names;
                }
            };
            tslib_1.__decorate([
                (0, __1.alias)("aaa")
            ], Rectangle.prototype, "names", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    return "1";
                }
            };
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)(),
                (0, __1.alias)("aaa")
            ], BooFactory);
            let BooFactory2 = class BooFactory2 {
                get() {
                    return "2";
                }
            };
            BooFactory2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)(),
                (0, __1.alias)("aaa")
            ], BooFactory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(BooFactory2);
            injector.register(BooFactory);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.join(",").should.be.eq("2,1");
        });
        it('should inject factory with nested factory', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    await sleep(10);
                    return this.fooFooManager.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooFooManager", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let FooManager = class FooManager {
                working() {
                    return this.fooManager2.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                working() {
                    return this.fooProvider.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return { name: "working" };
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);
            injector.addDefinition("fooFooManager", { injector: injector2, refName: "fooManager" });
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("working");
        });
        it('should inject factory with nested factory same class', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    await sleep(10);
                    return this.fooFooManager.working() + this.fooFooManager2.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooFooManager", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooFooManager2", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let FooManager = class FooManager {
                working() {
                    return this.fooManager2.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                working() {
                    return this.fooProvider.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return { name: "working" };
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);
            injector.addDefinition("fooFooManager", { injector: injector2, refName: "fooManager" });
            injector.addDefinition("fooFooManager2", { injector: injector2, refName: "fooManager" });
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("workingworking");
        });
        it('should inject factory with nested factory not singleton', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    await sleep(10);
                    return this.fooFooManager.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooFooManager", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let FooManager = class FooManager {
                working() {
                    return this.fooManager2.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                working() {
                    return this.fooProvider.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return { name: "working" };
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);
            injector.addDefinition("fooFooManager", { injector: injector2, refName: "fooManager" });
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("working");
        });
        it('should inject factory with nested factory with init method', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    await sleep(10);
                    return this.fooFooManager.working();
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooFooManager", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let FooManager = class FooManager {
                init() {
                    this.name = "lalala";
                }
                working() {
                    return this.fooManager2.working() + this.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            tslib_1.__decorate([
                (0, __1.init)()
            ], FooManager.prototype, "init", null);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                working() {
                    return this.fooProvider.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    await sleep(10);
                    return { name: "working" };
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector.register(Rectangle);
            injector.register(BooFactory);
            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);
            injector.addDefinition("fooFooManager", { injector: injector2, refName: "fooManager" });
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("workinglalala");
        });
        it('should inject factory with nested factory flow', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    return "1" + this.fooManager;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooManager", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "logger", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let Logger = class Logger {
                get() {
                    return "logger";
                }
            };
            Logger = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Logger);
            let FooManager = class FooManager {
                get() {
                    return "2" + this.fooManager2.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                get name() {
                    return "3" + this.fooProvider;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "logger", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    return "4";
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            injector.registerMulti([Rectangle, BooFactory, FooProvider, FooManager, FooManager2, Logger]);
            await injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.name.should.be.eq("1234");
        });
        it('should inject factory with nested throw error circular reference', async () => {
            let Rectangle = class Rectangle {
                get name() {
                    return this.booFactory;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], Rectangle.prototype, "booFactory", void 0);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            let BooFactory = class BooFactory {
                async get() {
                    return "1" + this.fooManager;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "fooManager", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], BooFactory.prototype, "logger", void 0);
            BooFactory = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], BooFactory);
            let Logger = class Logger {
                get() {
                    return "logger";
                }
            };
            Logger = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], Logger);
            let FooManager = class FooManager {
                get() {
                    return "2" + this.fooManager2.name;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager.prototype, "fooManager2", void 0);
            FooManager = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooManager);
            let FooManager2 = class FooManager2 {
                get name() {
                    return "3" + this.fooProvider;
                }
            };
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "fooProvider", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "booFactory", void 0);
            tslib_1.__decorate([
                (0, __1.inject)()
            ], FooManager2.prototype, "logger", void 0);
            FooManager2 = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], FooManager2);
            let FooProvider = class FooProvider {
                constructor() {
                }
                async get() {
                    return "4";
                }
            };
            FooProvider = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)(),
                (0, __1.factory)()
            ], FooProvider);
            injector = ioc.createContainer();
            injector.registerMulti([Rectangle, BooFactory, FooProvider, FooManager, FooManager2, Logger]);
            try {
                await injector.initialize();
                let rectangle = injector.getObject(Rectangle);
                rectangle.name.should.be.eq("1234");
            }
            catch (e) {
                e.message.should.be.eq("Factory circular reference booFactory-->fooManager-->fooManager2-->booFactory");
            }
        });
    });
    describe('inject factory Object to not singleton ', function () {
        it('should inject object after factory', async function () {
            let injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.manager.name;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    return this.fooManager2;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'manager',
                            factory: { id: 'fooManagerFactory' }
                        }
                    ]
                },
                fooManager2: {
                    type: FooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    factory: true,
                    type: FooManagerFactory,
                    singleton: true,
                    inject: [{ name: 'fooManager2', ref: 'fooManager2' }]
                }
            });
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object', function () {
        it('should inject object with get object', async function () {
            let injector = ioc.createContainer();
            class LocalFooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    return this.localFooManager;
                }
            }
            injector.addDefinitions({
                localFooManager: {
                    type: LocalFooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true, factory: true,
                    inject: [{ name: 'localFooManager', ref: "localFooManager" }]
                }
            });
            await injector.initialize();
            let fooManager = await injector.getFactory('fooManagerFactory');
            should.exist(fooManager);
            fooManager.should.be.instanceof(LocalFooManager);
            fooManager.name.should.be.equal("foo");
        });
    });
    describe('inject 2 factories', function () {
        it('should inject object with get object', async function () {
            let injector = ioc.createContainer();
            class LocalFooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class RemoteBarManager {
                constructor() {
                    this.name = 'bar';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    return this.localFooManager;
                }
            }
            class BarManagerFactory {
                constructor() {
                }
                get() {
                    return this.remoteBarManager;
                }
            }
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.fooManager.name;
                }
                getName2() {
                    return this.barManager.name;
                }
            }
            injector.addDefinitions({
                localFooManager: {
                    type: LocalFooManager,
                    singleton: true
                },
                remoteBarManager: {
                    type: RemoteBarManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: [{ name: 'localFooManager', ref: "localFooManager" }]
                },
                barManagerFactory: {
                    type: BarManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: [{ name: 'remoteBarManager', ref: "remoteBarManager" }]
                },
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [{ name: 'barManager', factory: { id: "barManagerFactory" } }, {
                            name: 'fooManager',
                            factory: { id: "fooManagerFactory" }
                        }]
                }
            });
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);
            rectangle.fooManager.should.be.instanceof(LocalFooManager);
            rectangle.barManager.should.be.instanceof(RemoteBarManager);
            rectangle.getName().should.be.equal("foo");
            rectangle.getName2().should.be.equal("bar");
        });
    });
    describe('inject factory with same object name', function () {
        it('should inject object after factory', async function () {
            let injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.fooManager.name;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class FooManagerFactory {
                constructor() {
                }
                get() {
                    this.fooManager.name += "Factory";
                    return this.fooManager;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [{
                            name: 'fooManager',
                            factory: { id: "fooManagerFactory" }
                        }]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: [{ name: 'fooManager', ref: "fooManager" }]
                }
            });
            await injector.initialize();
            //var rectangle = injector.getObject('rectangle');
            var fooManagerFactory = injector.getObject('fooManagerFactory');
            var rectangle = injector.getObject(Rectangle);
            should.exist(fooManagerFactory);
            should.exist(rectangle.fooManager);
            fooManagerFactory.should.be.instanceof(FooManager);
            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.name.should.be.eq("fooFactory");
        });
    });
});
//# sourceMappingURL=factory.js.map