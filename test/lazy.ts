"use strict";
import {Injector} from "../lib/inject";
import {customInjectFn, define, inject} from "../lib/decorators";
import    ioc = require('../lib/inject');
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
                return customInjectFn((inject: Injector) => {
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

});

