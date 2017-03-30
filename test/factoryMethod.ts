"use strict";
import {Injector} from "../lib/inject";
let should = require('chai').should(),
    inject = require('../lib/inject');

describe('Property Factory Method', function () {

    describe('inject factory method', function () {
        let injector: Injector, FooManager;



        it('should inject factory method that creates objects', function () {

            injector = inject.createContainer();

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

            injector = inject.createContainer();

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

            injector = inject.createContainer();

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

            injector.define('rectangle', Rectangle).injectFactoryMethod('createFooManager', 'fooManager')
                .define('fooManager', FooManager)


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
            injector = inject.createContainer();

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


});

