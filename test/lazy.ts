"use strict";
import {Injector} from "../lib/inject/inject";
import {customFn, define, inject, singleton} from "../";
import    ioc = require('..');
import chai = require('chai');

let should = chai.should();

describe('Lazy', function () {

    describe('inject lazy fn', function () {
        let injector: Injector;

        it('should inject lazy fn', function () {

            injector = ioc.createContainer();

            @define()
            class Test {
                @inject() testLazy: string;


            }

            injector.register('test', Test);
            injector.addDefinition("testLazy", {
                lazyFn: () => {
                    return "working"
                }
            })


            injector.initialize();

            let test: any = injector.getObject('test');

            test.testLazy.should.be.eq("working");

            let test2: any = injector.getObject('testLazy');

            test2.should.be.eq("working");


        });

        it('should inject lazy fn to class', function () {

            injector = ioc.createContainer();

            @define()
            class Test {

                test: string


            }

            injector.register('test', Test).injectLazyFn("test", function (inject) {
                return "working"
            });


            injector.initialize();

            let test: any = injector.getObject('test');

            test.test.should.be.eq("working");

        });

        it('should custom inject lazy fn to class', function () {

            injector = ioc.createContainer();

            let customDecorator = function (id: string) {
                return customFn((inject: Injector) => {
                    return inject.get<Test2>(id).name
                })
            };

            @define()
            class Test2 {

                name = "bbb"

            }


            @define()
            class Test {

                @customDecorator("test2")
                test: string


            }

            injector.registerMulti([Test, Test2])


            injector.initialize();

            let test: any = injector.getObject('test');

            test.test.should.be.eq("bbb");

        });

        it('should custom inject lazy fn to class nested parent', function () {

            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();

            let customDecorator = function (id: string) {
                return customFn((inject: Injector) => {
                    return injector2.get<Test2>(id).name
                })
            };

            @define()
            class Test2 {

                name = "bbb"

            }


            @define()
            class Test {

                @customDecorator("test2")
                test: string


            }

            injector2.parent = injector;
            injector2.register(Test2);

            injector.registerMulti([Test]);


            injector.initialize();

            let test: any = injector.getObject('test');

            test.test.should.be.eq("bbb");

        });
    })


    describe('create lazy object', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = ioc.createContainer();

            class Rectangle {
                number: number

                constructor() {
                    this.number = Math.random();
                }

                area() {
                    return 25;
                }


            }

            injector.register('rectangle', Rectangle).singleton().lazy()


            injector.initialize();
        });

        it('should not exist instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });

        it('should created lazy', function () {
            let rectangle: any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });

        it('should created lazy once', function () {
            let rectangle: any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);

            let r = rectangle.number;
            let r2 = injector.getObject<any>('rectangle').number;

            r.should.be.eq(r2)
        });

    });

    describe('inject lazy non singleton', function () {
        let injector: Injector;


        it('should crate lazy non singleton', async function () {
            injector = ioc.createContainer();

            @define()
            class Test {
                value: any

                constructor(value: any) {
                    this.value = value
                }


            }

            @define()
            @singleton()
            class Rectangle {
                @inject() test: Test


                constructor() {
                }


            }

            injector.registerMulti([Test, Rectangle]);


            await injector.initialize();

            let rectangle = injector.get<Rectangle>(Rectangle);
            should.exist(rectangle);
            rectangle.test.should.be.ok;
            should.not.exist(rectangle.test.value)


        });

    });

})
