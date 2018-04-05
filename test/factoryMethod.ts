"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";
import {IFactory} from "../lib/IFactory";
import {define, singleton, inject, injectAlias, alias, injectFactory, factory,initMethod,injectFactoryMethod} from "../lib/decorators";

let should = chai.should();


describe('Property Factory Method', function () {

    describe('inject factory method', function () {
        let injector: Injector, FooManager;



        it('should inject factory method that creates objects', function () {

            injector = ioc.createContainer();

            class Rectangle {
                createFooManager:Function
                constructor() {

                }

                getName() {

                    return this.createFooManager();
                }

            }

            class FooManager {
                name: string

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

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);
            rectangle.getName().should.be.instanceof(FooManager);
            rectangle.createFooManager.should.be.a('Function')


        });


    });

    describe('inject factory method with args', function () {
        let injector:Injector, FooManager;

        it('should inject factory method that creates objects and call object with args', function () {

            injector = ioc.createContainer();

             class Rectangle{
                 createFooManager:Function
                constructor() {

                }

                getName(name) {

                    return this.createFooManager(name).getName();
                }

            }

             class  FooManager{
                 name:string
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

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function')

            rectangle.createFooManager().should.be.instanceof(FooManager);

            should.exist(rectangle.createFooManager('test').name);

            rectangle.createFooManager('test').name.should.be.equal("test");

            rectangle.getName("test2").should.be.equal("test2")
        });
    });

    describe('inject factory method with args with linq', function () {
        let injector:Injector, FooManager;



        it('should inject factory method that creates objects and call object with args', function () {

            injector = ioc.createContainer();

            class Rectangle{
                createFooManager:Function
                constructor() {

                }

                getName(name) {

                    return this.createFooManager(name).getName();
                }

            }

            class FooManager{
                name:string
                constructor(name) {
                    this.name = name;
                }

                getName() {
                    return this.name;
                }
            }

            injector.register('rectangle', Rectangle).injectFactoryMethod('createFooManager', 'fooManager')
            injector.register('fooManager', FooManager)


            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function')

            rectangle.createFooManager().should.be.instanceof(FooManager);

            should.exist(rectangle.createFooManager('test').name);

            rectangle.createFooManager('test').name.should.be.equal("test");

            rectangle.getName("test2").should.be.equal("test2")
        });
    });


    describe('inject factory method with initialize init method', function () {
        let injector:Injector, FooManager;



        it('should inject factory method that creates objects and call object with initialize', function () {
            injector = ioc.createContainer();

            class Rectangle{
                createFooManager:Function
                constructor() {

                }

                getName(name) {

                    return this.createFooManager(name).getName();
                }

            }

            class FooManager{
                name:number
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

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function')

            rectangle.createFooManager().should.be.instanceof(FooManager);

            should.exist(rectangle.createFooManager().name);

            let name1 = rectangle.createFooManager().getName();

            let name2 = rectangle.createFooManager().getName();

            should.exist(name1);

            should.exist(name2);

            name1.should.not.be.equal(name2)
        });
    });


    describe('inject factory method with initialize init method with decorators', function () {
        let injector:Injector, FooManager;



        it('should inject factory method that creates objects and call object with initialize', function () {
            injector = ioc.createContainer();

            @define()
            class FooManager{
                name:number
                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = Math.random();
                }

                getName() {
                    return this.name;
                }
            }

            @define()
            class Rectangle{
                @injectFactoryMethod(FooManager) createFooManager:Function;
                constructor() {

                }

                getName(name) {

                    return this.createFooManager(name).getName();
                }

            }




            injector.register(FooManager)
            injector.register(Rectangle)

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function')

            rectangle.createFooManager().should.be.instanceof(FooManager);

            should.exist(rectangle.createFooManager().name);

            let name1 = rectangle.createFooManager().getName();

            let name2 = rectangle.createFooManager().getName();

            should.exist(name1);

            should.exist(name2);

            name1.should.not.be.equal(name2)
        });
    });

});

