"use strict";
import {Injector} from "../lib/inject";
import {alias, define, initMethod, inject, injectAlias, singleton} from "../lib/decorators";
import chai = require('chai');
import    ioc = require('../lib/inject');

let should = chai.should();

describe('Parent', function () {


    describe('get object from parent', function () {
        let injector: Injector, Rectangle;


        it('get object from parent', async function () {

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Test1 {
                name: string

                constructor() {
                    this.name = "aa"
                }

                @initMethod()
                initialize() {

                }
            }

            @define()
            @singleton()
            class Test2 {
                @inject() test1: Test1;
                name: string;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = this.test1.name + "bbb"
                }
            }


            injector = ioc.createContainer();
            injector.register(Test1);

            let injector2 = ioc.createContainer();
            injector2.register(Test2);
            injector2.parent = injector;


            await injector.initialize();
            //await injector2.initialize();

            let test2 = injector2.getObject<Test2>('test2');

            test2.name.should.be.eq("aabbb");

        });
    });

    describe('get object from child', function () {
        let injector: Injector, Rectangle;


        it('get object from child', async function () {

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Test1 {
                name: string

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = "aa"
                }
            }

            @define()
            @singleton()
            class Test2 {
                @inject() test1: Test1;
                name: string;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = this.test1.name + "bbb"
                }
            }


            injector = ioc.createContainer();
            injector.register(Test1);

            let injector2 = ioc.createContainer();
            injector2.register(Test2);
            injector2.addDefinition("test1", {injector: injector});


            await injector.initialize();
            await injector2.initialize();

            let test2 = injector2.getObject<Test2>('test2');

            test2.name.should.be.eq("aabbb");

        });
    });


    describe('get object from alias from parent', function () {
        let injector: Injector, Rectangle;


        it('get object from child', async function () {

            injector = ioc.createContainer();

            @define()
            @singleton()
            @alias("ITest")
            class Test1 {
                name: string;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = "aa"
                }
            }

            @define()
            @singleton()
            class Test2 {
                @injectAlias("ITest") test1: Test1[];

                len: number;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.len = this.test1.length
                }
            }


            injector = ioc.createContainer();
            injector.register(Test1);

            let injector2 = ioc.createContainer();
            injector2.register(Test2);


            injector2.parent = injector;

            await injector.initialize();

            let test2 = injector2.getObject<Test2>('test2');

            test2.len.should.be.eq(1);

        });
    });


});

