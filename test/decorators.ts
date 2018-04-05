"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";
import {define, singleton, injectAlias, alias,injectParam} from "../lib/decorators";

let should = chai.should();

describe('Decorators', function () {


    describe('should inject with inject params name', function () {

        let injector: Injector;

        @define()
        class Test {
            name() {
                return "test"
            }
        }

        @define()
        class Test2 {

            constructor(@injectParam("test") public  test1:Test){}


        }

        beforeEach(function () {
            injector = ioc.createContainer();
        })

        it("should have inject params in constructor",()=>{
            injector.register(Test)
            injector.register(Test2)
            injector.initialize();

            let test2 = injector.getObject<Test2>("test2");

            test2.test1.name().should.be.eq("test")
        })


    })

    describe('should inject with inject params constructor', function () {

        let injector: Injector;

        @define()
        class Test {
            name() {
                return "test"
            }
        }

        @define()
        class Test2 {

            constructor(@injectParam() public  test:Test){}


        }

        beforeEach(function () {
            injector = ioc.createContainer();
        })

        it("should have inject params in constructor",()=>{
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

            test(@injectParam() test?:Test){
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

        let injector: Injector, CalcManager, FooManager, Rectangle, Cleanable;

        beforeEach(async function () {
            injector = ioc.createContainer();


            @define()
            @singleton()
            class Rectangle {
                @injectAlias('calcable') calcable: any[]
                @injectAlias('cleanable') cleanable: any[]

                constructor() {

                }
            }

            @define()
            @singleton()
            @alias('calcable')
            class CalcManager {

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
            class FooManager {

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
            class BarManager {

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

        it('should inject property ', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);

            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);

        });

    })

});
