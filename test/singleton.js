"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ioc = require("..");
const chai = require("chai");
const __1 = require("../");
let should = chai.should();
describe('Singleton', function () {
    describe('create singleton object', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                }
            });
            await injector.initialize();
        });
        it('should save object in instances', function () {
            should.exist(injector.getInstances()['rectangle']);
        });
        it('should get object', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
        it('should have the same instance ', function () {
            let rectangle = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2 = injector.getObject('rectangle');
            number.should.equal(rectangle2.number);
        });
    });
    describe('create singleton object with decorators', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            };
            Rectangle = tslib_1.__decorate([
                __1.define(),
                __1.singleton()
            ], Rectangle);
            injector.register(Rectangle);
            await injector.initialize();
        });
        it('should save object in instances', function () {
            should.exist(injector.getInstances()['rectangle']);
        });
        it('should get object', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
        it('should have the same instance ', function () {
            let rectangle = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2 = injector.getObject('rectangle');
            number.should.equal(rectangle2.number);
        });
    });
    describe('create not singleton object', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                }
            });
            injector.initialize();
        });
        it('should save object in instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });
        it('should get object', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
        it('should have the same instance ', function () {
            let rectangle = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2 = injector.getObject('rectangle');
            number.should.not.equal(rectangle2.number);
        });
    });
});
//# sourceMappingURL=singleton.js.map