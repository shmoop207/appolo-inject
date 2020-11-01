"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";
import {define, singleton, alias, lazy, inject, aliasMap} from "../lib/decorators";

let should = chai.should();

describe('Decorators', function () {


    describe('should inject with inject params name', function () {

        let injector: Injector;


        beforeEach(function () {
            injector = ioc.createContainer();
        })

        it("should have inject params in constructor",()=>{

            @define()
            class Test {
                name() {
                    return "test"
                }
            }

            @define()
            class Test2 {

                constructor(@inject("test") public  test1:Test){}


            }


            injector.register(Test)
            injector.register(Test2)
            injector.initialize();

            let test2 = injector.getObject<Test2>("test2");

            test2.test1.name().should.be.eq("test")
        })


    })

    describe('should inject with inject params constructor', function () {

        let injector: Injector;



        beforeEach(function () {
            injector = ioc.createContainer();
        })

        it("should have inject params in constructor",()=>{

            @define()
            class Test {
                name() {
                    return "test"
                }
            }

            @define()
            class Test2 {

                constructor(@inject() public  test:Test){}


            }

            injector.register(Test)
            injector.register(Test2)
            injector.initialize();

            let test2 = injector.getObject<Test2>("test2");

            test2.test.name().should.be.eq("test")
        })


    })

    describe('should inject with inject params method', function () {

        let injector: Injector;

        @define()
        class Test {
            name() {
                return "test"
            }
        }

        @define()
        class Test2 {

            constructor(){}

            test(@inject() test?:Test){
                return test.name()
            }


        }

        beforeEach(function () {
            injector = ioc.createContainer();
        })

        it("should have inject params in method",()=>{
            injector.register(Test)
            injector.register(Test2)
            injector.initialize();

            let test2 = injector.getObject<Test2>("test2");

            test2.test().should.be.eq("test")
        })


    })

    describe('should inject with decorators', function () {

        let injector: Injector;

        beforeEach(async function () {
            injector = ioc.createContainer();

            interface ICalc{
                calc()
            }

            @define()
            @singleton()
            class Rectangle {
                @alias('calcable') calcable: any[]
                @alias('cleanable') cleanable: any[]
                @aliasMap<ICalc>('calcable',(item)=>item.constructor.name) cleanableMap: Map<string,ICalc>

                constructor() {

                }
            }

            @define()
            @singleton()
            @alias('calcable')
            class CalcManager  implements ICalc{

                constructor() {

                }

                calc() {
                    return 25
                }
            }

            @define()
            @singleton()
            @alias('calcable')
            @alias('cleanable')
            class FooManager implements ICalc{

                constructor() {

                }

                calc() {
                    return 25
                }

                cleanable() {

                }
            }

            @define()
            @singleton()
            @alias('calcable')
            class BarManager implements ICalc{

                constructor() {

                }

                calc() {
                    return 25
                }

                cleanable() {

                }
            }

            injector.register(Rectangle);
            injector.register(CalcManager);
            injector.register(BarManager);
            injector.register(FooManager);

            await injector.initialize();
        });

        it('should inject alias property ', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);

            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);

            rectangle.cleanableMap.size.should.be.equal(3);
            rectangle.cleanableMap.should.be.instanceOf(Map)

            rectangle.cleanableMap.get("FooManager").constructor.name.should.be.eq("FooManager")

        });

    })



    describe('should inject with lazy', function () {

        let injector: Injector, CalcManager, FooManager, Rectangle, Cleanable;

        beforeEach(async function () {
            injector = ioc.createContainer();


            @define()
            @singleton()
            class FooManager {
                public get name(){
                    return this.constructor.name;
                }
            }


            @define()
            @singleton()
            class Rectangle {
                @lazy() fooManager: FooManager;

                @lazy("someName") fooManager2: FooManager;

                constructor() {

                }
            }

            injector.register(Rectangle);

            await injector.initialize();

            injector.addObject("fooManager",new FooManager());
            injector.addObject("someName",new FooManager());
        });

        it('should inject property with lazy ', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);
            should.exist(rectangle.fooManager2);


            rectangle.fooManager2.name.should.be.eq("FooManager")

        });

    })


    describe('should inject with lazy inject the same instance', function () {

        let injector: Injector

        beforeEach(async function () {
            injector = ioc.createContainer();


            @define()
            class FooManager {
                public get name(){
                    return this.constructor.name;
                }
            }


            @define()
            @singleton()
            class Rectangle {
                @lazy() fooManager: FooManager;

                constructor() {

                }
            }

            injector.register(Rectangle);
            injector.register(FooManager)

            await injector.initialize();

        });

        it('should inject property with lazy ', function () {

            let rectangle: any = injector.getObject('rectangle');

            (rectangle.fooManager === rectangle.fooManager).should.be.ok;

        });

    })


});
