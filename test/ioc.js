"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inject = require("../lib/inject");
let should = require('chai').should();
describe('Ioc', function () {
    describe('create ioc', function () {
        it('should crate empty Ioc', function () {
            let injector = inject.createContainer();
            should.exist(injector.getInstances());
        });
        it('should add add definitions', function () {
            let injector = inject.createContainer();
            injector.addDefinitions({
                test: {
                    type: 'test'
                }
            });
            should.exist(injector.getDefinition('test'));
        });
        it('should add duplicate definitions', function () {
            let injector = inject.createContainer();
            let Test1 = class Test1 {
            };
            let Test2 = class Test1 {
            };
            injector.addDefinitions({
                test: {
                    type: Test1
                }
            });
            injector.addDefinitions({
                test: {
                    type: Test2
                }
            });
            injector.initialize();
            injector.get('test').should.be.an.instanceOf(Test2);
        });
    });
    describe('get simple object', function () {
        let injector;
        it('should get object', function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
        });
    });
    describe('get simple object with linq', function () {
        it('should get object', function () {
            class Rectangle {
                constructor() {
                }
            }
            let injector = inject.createContainer();
            injector.define('rectangle', Rectangle);
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
        });
    });
    describe('get simple object error', function () {
        let injector;
        it('should throw error if object not found', function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle
                }
            });
            injector.initialize();
            (function () {
                var rectangle = injector.getObject('rectangle2');
            }).should.throw("Injector:can't find object definition for objectID:rectangle2");
        });
    });
    describe('reset ioc', function () {
        let injector;
        beforeEach(function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle
                }
            });
            injector.initialize();
        });
        it('should reset ioc', function () {
            should.exist(injector.getDefinition('rectangle'));
            should.exist(injector.getObject('rectangle'));
            injector.reset();
            should.not.exist(injector.getDefinition('rectangle'));
            (function () {
                let rectangle = injector.getObject('rectangle');
            }).should.throw();
        });
    });
    describe('add object', function () {
        let injector;
        beforeEach(function () {
            injector = inject.createContainer();
            injector.initialize();
        });
        it('should add object', function () {
            function Test() {
            }
            injector.addObject('test', new Test());
            let test = injector.getObject('test');
            should.exist(test);
            test.should.be.an.instanceOf(Test);
        });
    });
    describe('get object by type', function () {
        let injector;
        it('should get by type', function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            class Circle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                }
            });
            injector.addDefinitions({
                circle: {
                    type: Circle,
                    singleton: true
                }
            });
            injector.initialize();
            let objects = injector.getObjectsByType(Rectangle);
            objects.should.be.instanceof(Array).and.have.lengthOf(1);
            objects[0].should.be.instanceof(Rectangle);
        });
    });
    describe('get object with existing obj', function () {
        let injector, Rectangle, Circle;
        beforeEach(function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
            }
            class Circle {
                constructor() {
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                }
            });
            injector.addDefinitions({
                circle: {
                    type: Circle,
                    singleton: true
                }
            });
            injector.addObject("test", {});
        });
        it('should not throw error', function () {
            (function () {
                injector.initialize();
            }).should.not.throw();
        });
    });
});
//# sourceMappingURL=ioc.js.map