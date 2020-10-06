"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ioc = require("../lib/inject");
const chai = require("chai");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Property Ref', function () {
    describe('inject object by ref', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                area() {
                    return this.calcManager.calc();
                }
            }
            class CalcManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'calcManager',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });
            injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
    });
    describe('inject property with different name', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                area() {
                    return this.calc.calc();
                }
            }
            class CalcManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'calc',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });
            injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
            should.not.exist(rectangle.CalcManager);
        });
    });
    describe('inject property with properties  def', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                area() {
                    return this.calc.calc();
                }
            }
            class CalcManager {
                constructor() {
                }
                calc() {
                    return 25;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'calc',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });
            injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
            should.not.exist(rectangle.CalcManager);
        });
    });
    describe('inject property with inject array', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name() + this.barManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo';
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [{ name: 'fooManager', ref: 'fooManager' }, { name: 'barManager', ref: 'barManager' }]
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
            injector.initialize();
        });
        it('should inject property with inject array', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with nested properties', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo' + this.barManager.name();
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [{ name: 'fooManager', ref: "fooManager" }]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true,
                    inject: [{ name: 'barManager', ref: 'barManager' }]
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });
            await injector.initialize();
        });
        it('should inject property with nested properties', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.not.exist(rectangle.barManager);
            should.exist(rectangle.fooManager.barManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with inject array (object notation)', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name() + this.myBarManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo';
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: ['fooManager', { name: 'myBarManager', ref: 'barManager' }]
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
            injector.initialize();
        });
        it('should inject property with inject array', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.myBarManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with nested properties link', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo' + this.barManager.name();
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.register('rectangle', Rectangle).inject(['fooManager']);
            injector.register('fooManager', FooManager).inject('barManager');
            injector.register('barManager', BarManager);
            injector.initialize();
        });
        it('should inject property with nested properties', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.not.exist(rectangle.barManager);
            should.exist(rectangle.fooManager.barManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with inject array (object notation) link', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name() + this.myBarManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo';
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.register('rectangle', Rectangle).inject('fooManager').inject('myBarManager', 'barManager');
            injector.register('fooManager', FooManager);
            injector.register('barManager', BarManager);
            injector.initialize();
        });
        it('should inject property with inject array', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.myBarManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with inject space (object notation) link', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name() + this.barManager.name();
                }
            }
            class FooManager {
                constructor() {
                }
                name() {
                    return 'foo';
                }
            }
            class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            }
            injector.register('rectangle', Rectangle).inject('fooManager barManager');
            injector.register('fooManager', FooManager);
            injector.register('barManager', BarManager);
            injector.initialize();
        });
        it('should inject property with inject array', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);
            rectangle.name().should.equal('foobar');
        });
    });
    describe('inject property with inject space (object notation) with decorators', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                }
                name() {
                    return this.fooManager.name() + this.barManager.name();
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "fooManager", void 0);
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "barManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                }
                name() {
                    return 'foo';
                }
            };
            FooManager = tslib_1.__decorate([
                decorators_1.define()
            ], FooManager);
            let BarManager = class BarManager {
                constructor() {
                }
                name() {
                    return 'bar';
                }
            };
            BarManager = tslib_1.__decorate([
                decorators_1.define()
            ], BarManager);
            injector.register(Rectangle);
            injector.register(FooManager);
            injector.register(BarManager);
            injector.initialize();
        });
        it('should inject property with inject array', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);
            rectangle.name().should.equal('foobar');
        });
    });
});
//# sourceMappingURL=property.js.map