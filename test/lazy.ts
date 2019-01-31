"use strict";
import {Injector} from "../lib/inject";
import    ioc = require('../lib/inject');
import chai = require('chai');
import {alias, define, factory, inject, injectAlias, injectFactory, singleton} from "../lib/decorators";

let should = chai.should();

describe('Lazy', function () {

    describe('inject lazy fn', function () {
        let injector: Injector;

        beforeEach(function () {
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
        });

        it('should inject lazy fn', function () {
            let test: any = injector.getObject('test');

            test.testLazy.should.be.eq("working");

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

