"use strict";
import chai = require('chai');
import    ioc = require('..');
import {Injector} from "../lib/inject/inject";
import {IFactory} from "../lib/interfaces/IFactory";
import {
    define,
    singleton,
    inject,
    alias,
    factory,
    init,
    factoryMethod,
    dynamicFactory,
    factoryMethodAsync
} from "../";

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
                    inject: [
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
                    inject: [
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
                    inject: [
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

        it('should inject factory method that creates objects and call object with initialize async', async function () {
            injector = ioc.createContainer();

            @define()
            class FooManager{
                name:number
                constructor() {

                }

                @init()
                initialize() {
                    this.name = Math.random();
                }

                getName() {
                    return this.name;
                }
            }

            @define()
            class Rectangle{
                @factoryMethodAsync(FooManager) createFooManager:()=>FooManager;
                constructor() {

                }

                async getName() {

                   let result =  await this.createFooManager()

                    return result.getName()
                }

            }

            injector.registerMulti([FooManager,Rectangle])

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function')

            //rectangle.createFooManager().should.be.instanceof(FooManager);

            //should.exist(rectangle.createFooManager().name);

            let name1 = await rectangle.getName();

            let name2 = await rectangle.getName();

            should.exist(name1);

            should.exist(name2);

            name1.should.not.be.equal(name2)
        });


        it('should inject factory method that creates objects and call object with initialize', function () {
            injector = ioc.createContainer();

            @define()
            class FooManager{
                name:number
                constructor() {

                }

                @init()
                initialize() {
                    this.name = Math.random();
                }

                getName() {
                    return this.name;
                }
            }

            @define()
            class Rectangle{
                @factoryMethod(FooManager) createFooManager:Function;
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


    describe('inject factory method with dynamic factory', function () {
        let injector:Injector, FooManager;


        it('should inject factory method with dynamic factory', async function () {
            injector = ioc.createContainer();


            @define()
            class BooManager{

                constructor(public name2:string) {

                }
            }
            @define()
            @dynamicFactory()
            class FooManager{

                @factoryMethod(BooManager) createFooManager: (name:string)=>FooManager;
                constructor(public name:string) {

                }

                get(){
                    return this.createFooManager(this.name);
                }

            }



            @define()
            class Rectangle {
                @factoryMethod(FooManager) createFooManager: (name:string)=>BooManager;

                constructor() {

                }
                getName(name) {

                    return this.createFooManager(name).name2;
                }
            }


            injector.registerMulti([FooManager,Rectangle,BooManager]);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Function');

            rectangle.createFooManager("boo").should.be.instanceof(BooManager);

            should.exist(rectangle.createFooManager("boo").name2);

            rectangle.createFooManager("boo").name2.should.be.eq("boo")
        });
    });

});

