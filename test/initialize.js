"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("..");
const __1 = require("../");
let should = chai.should();
describe('initialize', function () {
    describe('should call initialize method', function () {
        let injector, Rectangle;
        it('should call initialize method', async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    initMethod: 'initialize'
                }
            });
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
    });
    describe('should call initialize method linq', function () {
        let injector;
        it('should call initialize method', async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
            }
            injector.register('rectangle', Rectangle).singleton().initMethod('initialize');
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
    });
    describe('should call initialize method decorators', function () {
        it('should call initialize method', async function () {
            let injector;
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
            };
            tslib_1.__decorate([
                (0, __1.init)()
            ], Rectangle.prototype, "initialize", null);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
        it('should call bootstrap method', async function () {
            let injector;
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
                bootstrap() {
                    this.working2 = true;
                }
            };
            tslib_1.__decorate([
                (0, __1.init)()
            ], Rectangle.prototype, "initialize", null);
            tslib_1.__decorate([
                (0, __1.bootstrap)()
            ], Rectangle.prototype, "bootstrap", null);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
            rectangle.working2.should.be.true;
        });
        it('should call fire create event', async function () {
            let injector;
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
            };
            tslib_1.__decorate([
                (0, __1.init)()
            ], Rectangle.prototype, "initialize", null);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            injector.register(Rectangle);
            let req;
            injector.events.instanceInitialized.on(action => {
                req = action.instance;
            });
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
            req.should.be.equal(rectangle);
        });
    });
    describe('should call initialize method decorators', function () {
        it('should call initialize method async ', async function () {
            let injector;
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
                async initialize() {
                    await new Promise(resolve => setTimeout(() => resolve(), 1));
                    this.working = "aa";
                }
                async bootstrap() {
                    await new Promise(resolve => setTimeout(() => resolve(), 1));
                    this.working2 = this.working + "bb";
                }
            };
            tslib_1.__decorate([
                (0, __1.initAsync)()
            ], Rectangle.prototype, "initialize", null);
            tslib_1.__decorate([
                (0, __1.bootstrapAsync)()
            ], Rectangle.prototype, "bootstrap", null);
            Rectangle = tslib_1.__decorate([
                (0, __1.define)(),
                (0, __1.singleton)()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.eq("aa");
            rectangle.working2.should.be.eq("aabb");
        });
    });
});
//# sourceMappingURL=initialize.js.map