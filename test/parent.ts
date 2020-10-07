"use strict";
import {Injector} from "../lib/inject";
import {
    alias,
    aliasFactory,
    define,
    factory,
    init,
    inject,
    factoryMethod,
    singleton
} from "../lib/decorators";
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import    ioc = require('../lib/inject');

chai.use(sinonChai);
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

                @init()
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

                @init()
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

                @init()
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

                @init()
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

                @init()
                initialize() {
                    this.name = "aa"
                }
            }

            @define()
            @singleton()
            class Test2 {
                @alias("ITest") test1: Test1[];

                len: number;

                constructor() {

                }

                @init()
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

                @alias("Alias") test: Alias[];
                @aliasFactory("Alias2") createAlias2: (() => Alias2)[];
                @factoryMethod(Alias) createAlias: () => Alias

                name: string;

                constructor() {

                }

                @init()
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


        describe('inherit from child', function () {


            it('should inject nested parent', async function () {

                let injector = ioc.createContainer();
                let injector2 = ioc.createContainer();
                let injector3 = ioc.createContainer();

                @define()
                @singleton()
                class ClassA {

                    public name: string = "working";
                }


                injector.register(ClassA);
                injector.parent = injector2;

                injector2.addDefinition("classA", {
                    injector: injector,
                    refName: "classA"
                });
                injector2.parent = injector3;
                injector3.addDefinition("classA", {
                    injector: injector2,
                    refName: "classA"
                });


                await injector3.initialize();
                let test1 = injector3.getObject<ClassA>(ClassA);

                test1.name.should.be.ok;
            });

            it('should have diffrent injects', async function () {

                let injector = ioc.createContainer();
                let injector2 = ioc.createContainer();

                @define()
                @singleton()
                class ClassA {

                    public name: string = "working";
                }


                injector.register(ClassA);
                injector2.register(ClassA);

                injector.getDefinition(ClassA).injector.should.be.equal(injector);
                injector2.getDefinition(ClassA).injector.should.be.equal(injector2);

            });


        });

        describe('fire parent events', function () {


            it('should fire created events', async function () {

                let injector = ioc.createContainer();
                let injector2 = ioc.createContainer();

                @define()
                @singleton()
                class ClassA {

                    public name: string = "working";
                }

                @define()
                @singleton()
                class ClassB {

                    public name: string = "working";
                }


                injector.register(ClassA);
                injector.parent = injector2;

                injector2.register(ClassB);

                let spy1 = sinon.spy();
                let spy2 = sinon.spy();
                let spy3 = sinon.spy();
                let spy4 = sinon.spy();
                let spy5 = sinon.spy();

                injector2.events.instanceCreated.on(spy1);
                injector2.events.instanceOwnCreated.on(spy2);

                injector2.events.instanceInitialized.on(spy3);
                injector2.events.instanceOwnInitialized.on(spy4);

                injector2.events.beforeInitialize.on(spy5);
                injector2.events.beforeInitMethods.on(spy5);
                injector2.events.beforeBootstrapMethods.on(spy5);
                injector2.events.afterInitialize.on(spy5);

                await injector2.initialize();

                spy1.should.have.been.callCount(2);
                spy2.should.have.been.callCount(1);
                spy5.should.have.been.callCount(4);

                spy1.getCall(0).args[0].definition.type.should.be.equal(ClassA);
                spy1.getCall(0).args[0].instance.constructor.should.be.equal(ClassA);
            });


        });


    });

});
