"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let should = require('chai').should(), inject = require('../lib/inject');
describe('Singleton', function () {
    describe('create singleton object', function () {
        let injector;
        beforeEach(function () {
            injector = inject.createContainer();
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
            injector.initialize();
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
            injector = inject.createContainer();
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