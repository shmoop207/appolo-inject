"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Property Factory Method', function () {
    describe('inject factory method', function () {
        let injector, FooManager;
        it('should inject factory method that creates objects', function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.createFooManager();
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'createFooManager',
                            factoryMethod: 'fooManager'
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    singleton: false
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.getName().should.be.instanceof(FooManager);
            rectangle.createFooManager.should.be.a('Function');
        });
    });
    describe('inject factory method with args', function () {
        let injector, FooManager;
        it('should inject factory method that creates objects and call object with args', function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager(name).getName();
                }
            }
            class FooManager {
                constructor(name) {
                    this.name = name;
                }
                getName() {
                    return this.name;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'createFooManager',
                            factoryMethod: 'fooManager'
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    singleton: false
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            rectangle.createFooManager().should.be.instanceof(FooManager);
            should.exist(rectangle.createFooManager('test').name);
            rectangle.createFooManager('test').name.should.be.equal("test");
            rectangle.getName("test2").should.be.equal("test2");
        });
    });
    describe('inject factory method with args with linq', function () {
        let injector, FooManager;
        it('should inject factory method that creates objects and call object with args', function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager(name).getName();
                }
            }
            class FooManager {
                constructor(name) {
                    this.name = name;
                }
                getName() {
                    return this.name;
                }
            }
            injector.register('rectangle', Rectangle).injectFactoryMethod('createFooManager', 'fooManager');
            injector.register('fooManager', FooManager);
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            rectangle.createFooManager().should.be.instanceof(FooManager);
            should.exist(rectangle.createFooManager('test').name);
            rectangle.createFooManager('test').name.should.be.equal("test");
            rectangle.getName("test2").should.be.equal("test2");
        });
    });
    describe('inject factory method with initialize init method', function () {
        let injector, FooManager;
        it('should inject factory method that creates objects and call object with initialize', function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager(name).getName();
                }
            }
            class FooManager {
                constructor() {
                }
                initialize() {
                    this.name = Math.random();
                }
                getName() {
                    return this.name;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'createFooManager',
                            factoryMethod: 'fooManager'
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    initMethod: 'initialize',
                    singleton: false
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            rectangle.createFooManager().should.be.instanceof(FooManager);
            should.exist(rectangle.createFooManager().name);
            let name1 = rectangle.createFooManager().getName();
            let name2 = rectangle.createFooManager().getName();
            should.exist(name1);
            should.exist(name2);
            name1.should.not.be.equal(name2);
        });
    });
    describe('inject factory method with initialize init method with decorators', function () {
        let injector, FooManager;
        it('should inject factory method that creates objects and call object with initialize async', async function () {
            injector = ioc.createContainer();
            let FooManager = class FooManager {
                constructor() {
                }
                initialize() {
                    this.name = Math.random();
                }
                getName() {
                    return this.name;
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], FooManager.prototype, "initialize", null);
            FooManager = tslib_1.__decorate([
                decorators_1.define()
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
                async getName() {
                    let result = await this.createFooManager();
                    return result.getName();
                }
            };
            tslib_1.__decorate([
                decorators_1.injectFactoryMethodAsync(FooManager)
            ], Rectangle.prototype, "createFooManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define()
            ], Rectangle);
            injector.registerMulti([FooManager, Rectangle]);
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            //rectangle.createFooManager().should.be.instanceof(FooManager);
            //should.exist(rectangle.createFooManager().name);
            let name1 = await rectangle.getName();
            let name2 = await rectangle.getName();
            should.exist(name1);
            should.exist(name2);
            name1.should.not.be.equal(name2);
        });
        it('should inject factory method that creates objects and call object with initialize', function () {
            injector = ioc.createContainer();
            let FooManager = class FooManager {
                constructor() {
                }
                initialize() {
                    this.name = Math.random();
                }
                getName() {
                    return this.name;
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], FooManager.prototype, "initialize", null);
            FooManager = tslib_1.__decorate([
                decorators_1.define()
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager(name).getName();
                }
            };
            tslib_1.__decorate([
                decorators_1.injectFactoryMethod(FooManager)
            ], Rectangle.prototype, "createFooManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define()
            ], Rectangle);
            injector.register(FooManager);
            injector.register(Rectangle);
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            rectangle.createFooManager().should.be.instanceof(FooManager);
            should.exist(rectangle.createFooManager().name);
            let name1 = rectangle.createFooManager().getName();
            let name2 = rectangle.createFooManager().getName();
            should.exist(name1);
            should.exist(name2);
            name1.should.not.be.equal(name2);
        });
    });
    describe('inject factory method with dynamic factory', function () {
        let injector, FooManager;
        it('should inject factory method with dynamic factory', async function () {
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
                decorators_1.dynamicFactory()
            ], FooManager);
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName(name) {
                    return this.createFooManager(name).name2;
                }
            };
            tslib_1.__decorate([
                decorators_1.injectFactoryMethod(FooManager)
            ], Rectangle.prototype, "createFooManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define()
            ], Rectangle);
            injector.registerMulti([FooManager, Rectangle, BooManager]);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.createFooManager);
            rectangle.createFooManager.should.be.a('Function');
            rectangle.createFooManager("boo").should.be.instanceof(BooManager);
            should.exist(rectangle.createFooManager("boo").name2);
            rectangle.createFooManager("boo").name2.should.be.eq("boo");
        });
    });
});
//# sourceMappingURL=factoryMethod.js.map