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
        it('should call initialize method', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                rectangle.working.should.be.true;
            });
        });
    });
    describe('should call initialize method linq', function () {
        let injector;
        it('should call initialize method', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                injector = ioc.createContainer();
                class Rectangle {
                    constructor() {
                    }
                    initialize() {
                        this.working = true;
                    }
                }
                injector.register('rectangle', Rectangle).singleton().initMethod('initialize');
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                rectangle.working.should.be.true;
            });
        });
    });
    describe('should call initialize method decorators', function () {
        it('should call initialize method', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                rectangle.working.should.be.true;
            });
        });
    });
});
//# sourceMappingURL=initialize.js.map