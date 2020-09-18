"use strict";
import {Injector} from "../lib/inject";
import    ioc = require('../lib/inject');
import chai = require('chai');

let should = chai.should();


describe('Ioc', function () {
    describe('create ioc', function () {

        it('should crate empty Ioc', function () {
            let injector = ioc.createContainer();

            should.exist(injector.getInstances());
        });

        it('should add add definitions', function () {
            let injector = ioc.createContainer();

            injector.addDefinitions({
                test: {
                    type: 'test'
                }
            });

            should.exist(injector.getDefinition('test'));
        });


        it('should add duplicate definitions', function () {
            let injector = ioc.createContainer();


            let Test1 = class Test1 {
            }
            let Test2 = class Test1 {
            }

            injector.addDefinitions({
                test: {
                    type: Test1
                }
            });

            injector.addDefinitions({
                test: {
                    type: Test2, override: true
                }
            })

            injector.initialize();

            injector.get('test').should.be.an.instanceOf(Test2)

        });
    });

    describe('get simple object', function () {
        let injector: Injector;

        it('should get object', function () {

            injector = ioc.createContainer();

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

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle);
        });
    });

    describe('get simple object with linq', function () {


        it('should get object', function () {

            class Rectangle {

                constructor() {

                }
            }

            let injector = ioc.createContainer();
            injector.register('rectangle', Rectangle)

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle);
        });
    });

    describe('get simple object error', function () {
        let injector: Injector;

        it('should throw error if object not found', function () {

            injector = ioc.createContainer();

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
            }).should.throw("Injector:can't find object definition for objectID:rectangle2")


        });

        it('should throw error if object not found inner', function () {

            injector = ioc.createContainer();

            class Rectangle {

                constructor() {

                }
            }


            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    inject: ["test"]
                }
            });

            injector.initialize();

            (function () {
                var rectangle = injector.getObject('rectangle');
            }).should.throw("Injector:can't find object definition for objectID:test")


        });

    });


    describe('reset ioc', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = ioc.createContainer();

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
            }).should.throw()

        });
    });

    describe('add object', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = ioc.createContainer();


            injector.initialize();
        });


        it('should add object', function () {

            function Test() {
            }

            injector.addObject('test', new Test());

            let test = injector.getObject('test');

            should.exist(test);

            test.should.be.an.instanceOf(Test)

        });
    });

    describe('get object by type', function () {
        let injector: Injector;


        it('should get by type', async function () {

            injector = ioc.createContainer();

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

           await injector.initialize();

            let objects = injector.getObjectsByType(Rectangle);

            objects.should.be.instanceof(Array).and.have.lengthOf(1);

            objects[0].should.be.instanceof(Rectangle);
        });
    });


    describe('get object with existing obj', function () {
        let injector: Injector, Rectangle, Circle;

        beforeEach(function () {
            injector = ioc.createContainer();

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

            injector.addObject("test", {})


        });

        it('should not throw error', function () {

            (function () {
                injector.initialize()
            }).should.not.throw();
        });
    });


});
