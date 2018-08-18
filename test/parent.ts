"use strict";
import {Injector} from "../lib/inject";
import {
    alias,
    aliasFactory,
    define,
    factory,
    initMethod,
    inject,
    injectAlias,
    injectAliasFactory,
    injectFactoryMethod,
    singleton
} from "../lib/decorators";
import chai = require('chai');
import    ioc = require('../lib/inject');
import ITest = Mocha.ITest;

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


    describe('inherit from child', function () {
        let injector: Injector, Rectangle;


        it('should inherit  object from child', async function () {

            injector = ioc.createContainer();

            @define()
            @singleton()
            @alias("Alias")
            class Alias {

            }

            @define()
            @aliasFactory("Alias2")
            class Alias2 {

            }

            @define()
            @singleton()
            @factory()
            class Factory {
                async get() {
                    return "working"
                }
            }

            @define()
            @singleton()
            class Test1 {
                @inject() env: any;
                @inject() logger: any;
                @inject() factory: Factory;

                @injectAlias("Alias") test: Alias[];
                @injectAliasFactory("Alias2") createAlias2: (() => Alias2)[];
                @injectFactoryMethod(Alias) createAlias: () => Alias

                name: string;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.name = "aa" + this.env.name
                }
            }

            @define()
            @singleton()
            class Test2 extends Test1 {


            }


            injector = ioc.createContainer();
            injector.register(Test1);
            injector.register(Alias);
            injector.register(Alias2);
            injector.register(Factory);
            injector.addObject("env", {name: "bbb"})

            let injector2 = ioc.createContainer();
            injector2.addObject("env", {name: "ccc"})
            injector2.addObject("logger", {info: "bla"})
            injector2.register(Test2);


            injector.parent = injector2;

            await injector2.initialize();
            let test1 = injector.getObject<Test2>('test1');

            let test2 = injector2.getObject<Test2>('test2');

            test2.name.should.be.eq("aabbb");
            test2.test[0].constructor.name.should.be.eq("Alias")
            test2.createAlias().constructor.name.should.be.eq("Alias")
            test2.createAlias2[0]().constructor.name.should.be.eq("Alias2")
            test2.factory.should.be.eq("working")
            test2.logger.info.should.be.eq("bla")
        });
    });


});

