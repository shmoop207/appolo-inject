"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
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
                decorators_1.initMethod()
            ], Rectangle.prototype, "initialize", null);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
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
                    this.working = true;
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethodAsync()
            ], Rectangle.prototype, "initialize", null);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
    });
});
//# sourceMappingURL=initialize.js.map