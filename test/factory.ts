"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import sleep = require ('sleep-promise');
import _ = require ('lodash');
import {Injector} from "../lib/inject";
import {IFactory} from "../lib/IFactory";
import {
    alias,
    define,
    factory,
    initMethod,
    inject,
    injectAlias,
    injectFactory,
    injectorAware,
    singleton
} from "../lib/decorators";

let should = chai.should();

describe('Property Factory', function () {

    describe('inject factory Object', function () {
        let injector: Injector;

        it('should inject object after factory', async function () {

            injector = ioc.createContainer();

            class Rectangle {
                manager: any

                constructor() {

                }

                getName() {

                    return this.manager.name;
                }

            }

            class FooManager {
                name: string

                constructor() {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory {
                fooManager2: any

                constructor() {

                }

                get() {
                    return this.fooManager2;
                }
            }


            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    properties: [
                        {
                            name: 'manager',
                            factory: {id: 'fooManagerFactory'}
                        }
                    ]
                },
                fooManager2: {
                    type: FooManager,
                    singleton: true

                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    factory: true,
                    singleton: true,
                    inject: ['fooManager2']

                }
            });

            await injector.initialize();

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object linq', function () {
        let injector: Injector, FooManager;

        it('should inject object after factory', async function () {

            class Rectangle {
                manager: any

                constructor() {

                }

                getName() {

                    return this.manager.name;
                }

            }

            class FooManager {
                name: any

                constructor() {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory {
                fooManager2: any

                constructor() {

                }

                get() {
                    return this.fooManager2;
                }
            }

            injector = ioc.createContainer()
            injector.register('rectangle', Rectangle).singleton().injectFactory('manager', 'fooManagerFactory')
            injector.register('fooManager2', FooManager).singleton()
            injector.register('fooManagerFactory', FooManagerFactory).factory().singleton().inject('fooManager2')
            await injector.initialize();

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object with decorators', function () {
        let injector: Injector;

        it('should inject object after factory', async function () {

            @define()
            @singleton()
            class Rectangle {

                @injectFactory() fooManager: any;

                constructor() {

                }

                getName() {

                    return this.fooManager.name;
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                name: any;

                constructor() {
                    this.name = 'foo';
                }
            }

            @define()
            @singleton()
            @factory()
            class FooManager {
                @inject() fooManager2: FooManager2;

                constructor() {

                }

                get() {
                    this.fooManager2.name = this.fooManager2.name + "Factory";


                    return this.fooManager2;
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager2);
            injector.register(FooManager);
            await injector.initialize();

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager2);
            rectangle.fooManager.name.should.be.eq("fooFactory");
        });


        it('should inject object after factory with inject and same name as factory', async function () {

            @define()
            @singleton()
            class Rectangle {

                @inject() fooManager: any;

                constructor() {

                }

                getName() {

                    return this.fooManager.name;
                }

            }

            @define()
            @singleton()
            class FooManager {
                name: any;

                constructor() {
                    this.name = 'foo';
                }
            }

            @define()
            @singleton()
            @factory()
            class FooManagerFactory {
                @inject() fooManager: any;

                constructor() {

                }

                get() {
                    this.fooManager.name = this.fooManager.name + "Factory";

                    return this.fooManager;
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager);
            injector.register(FooManagerFactory);
            await injector.initialize();

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.name.should.be.eq("fooFactory");
        });


        it('should inject object after factory with inject  factory different name', async function () {

            @define()
            @singleton()
            class Rectangle {

                @inject() barSomeName: any;

                constructor() {

                }

                getName() {

                    return this.barSomeName.name;
                }

            }

            @define()
            @singleton()
            class FooManager {
                name: any;

                constructor() {
                    this.name = 'foo';
                }
            }

            @define()
            @singleton()
            @factory()
            class BarSomeName {
                @inject() fooManager: any;

                constructor() {

                }

                get() {
                    this.fooManager.name = this.fooManager.name + "Factory";

                    return this.fooManager;
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooManager);
            injector.register(BarSomeName);
            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            should.exist(rectangle.barSomeName);

            rectangle.barSomeName.should.be.instanceof(FooManager);
            rectangle.barSomeName.name.should.be.eq("fooFactory");
        });


        it('should inject multi factory', async function () {

            @define()
            @singleton()
            class Rectangle {

                @inject() factory1: any;

                constructor() {

                }

                getName() {

                    return this.factory1;
                }

            }


            @define()
            @singleton()
            @factory()
            class Factory1 {
                @inject() factory2: any;

                constructor() {

                }

                get() {
                    return this.factory2 + "factory1"
                }
            }

            @define()
            @singleton()
            @factory()
            class Factory2 {

                constructor() {

                }

                get() {
                    return "factory2"
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            injector.register(Factory2);
            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            //should.exist(rectangle.barSomeName);

            rectangle.getName().should.be.eq("factory2factory1");
        });

        // it.only('should inject multi factory async2', async ()=> {
        //     for(let i of  [100,10000,10]){
        //         await new Promise(resolve => {
        //             setTimeout(()=> resolve(),i)
        //         })
        //
        //         console.log(i)
        //     }
        // })

        it('should inject multi factory async', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() factory1: any;

                constructor() {

                }

                getName() {

                    return this.factory1;
                }

            }


            @define()
            @singleton()
            @factory()
            class Factory1 {
                @inject() factory2: any;

                constructor() {

                }

                async get() {
                    await sleep(10)
                    return this.factory2 + "factory1"
                }
            }

            @define()
            @singleton()
            @factory()
            class Factory2 {

                constructor() {

                }

                async get() {

                    await sleep(10)

                    return "factory2"
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            injector.register(Factory2);
            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.getName().should.be.eq("factory2factory1");

        });


        it('should inject multi factory async different containers', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() factory1: any;

                constructor() {

                }

                getName() {

                    return this.factory1;
                }

            }


            @define()
            @singleton()
            @factory()
            class Factory1 {
                @inject() factory2: any;

                constructor() {

                }

                public async get() {
                    await sleep(10);
                    return this.factory2 + "factory1"
                }
            }

            @define()
            @singleton()
            @factory()
            class Factory2 {

                constructor() {

                }

                public async get() {

                    await sleep(10);

                    return "factory2"
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);


            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", {injector: injector2});

            await injector2.initialize();
            await injector.initialize();


            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.getName().should.be.eq("factory2factory1");

        });

        it('should inject multi factory async parent container ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() factory1: any;
                @inject() factory2: any;

                constructor() {

                }

                getName() {

                    return this.factory1 + this.factory2;
                }

            }


            @define()
            @singleton()
            @factory()
            class Factory1 {

                constructor() {
                }

                public async get() {
                    await sleep(10);
                    return "factory1"
                }
            }

            @define()
            @singleton()
            @factory()
            class Factory2 {
                @inject() factory1: any;

                constructor() {

                }

                public async get() {

                    await sleep(10);

                    return this.factory1 + "factory2"
                }
            }

            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);


            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", {injector: injector2});

            //injector.startInitialize()


            //injector2.startInitialize()


            await injector.initialize();


            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.getName().should.be.eq("factory1factory1factory2");

        })


        it('should inject multi factory async multi child containers ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() factory1: any;
                @inject() fooManager: any;

                constructor() {

                }

                getName() {

                    return this.factory1 + this.fooManager.getName();
                }

            }

            @define()
            @singleton()
            class FooManager {

                @inject() factory1: any;

                constructor() {

                }

                getName() {

                    return this.factory1 + "FooManager";
                }

            }


            @define()
            @singleton()
            @factory()
            class Factory1 {

                constructor() {
                }

                public async get() {
                    await sleep(10);
                    return "factory1"
                }
            }


            injector = ioc.createContainer();
            injector.register(Rectangle);

            let injector2 = ioc.createContainer();
            injector2.register(FooManager);
            injector.addDefinition("fooManager", {injector: injector2})

            let injector3 = ioc.createContainer();

            injector.addDefinition("factory1", {injector: injector3});
            injector2.addDefinition("factory1", {injector: injector3});

            injector3.register(Factory1);


            await injector3.initialize();
            await injector2.initialize();
            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.getName().should.be.eq("factory1factory1FooManager");

        });


        it('should inject factory with same name child containers ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() fooManagerProvider: [FooManager, string];

                constructor() {

                }

                get name() {

                    return this.fooManagerProvider[0].name + this.fooManagerProvider[1];
                }

            }

            @define()
            @singleton()
            class FooManager {


                public name: string;

                constructor() {
                    this.name = "FooManager"
                }

            }


            @define()
            @singleton()
            @factory()
            class FooManagerProvider implements IFactory<[FooManager, string]> {
                @inject() fooManager: FooManager;

                constructor() {
                }

                public async get(): Promise<[FooManager, string]> {
                    await sleep(10);

                    return [this.fooManager, "WithFactory"]
                }
            }


            injector = ioc.createContainer();
            injector.register(Rectangle);

            let injector2 = ioc.createContainer();

            injector2.register(FooManager);
            injector2.register(FooManagerProvider);

            injector.addDefinition("fooManagerProvider", {injector: injector2});
            //injector.addDefinition("fooManagerFactory", {injector: injector2,factory:true});
            injector2.parent = injector;


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("FooManagerWithFactory");

        });

        it('should inject factory with ref name ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() barManager: [FooManager, string];

                constructor() {

                }

                get name() {

                    return this.barManager[0].name + this.barManager[1];
                }

            }

            @define()
            @singleton()
            class FooManager {


                public name: string;

                constructor() {
                    this.name = "FooManager"
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<[FooManager, string]> {
                @inject() fooManager: FooManager;

                constructor() {
                }

                public async get(): Promise<[FooManager, string]> {
                    await sleep(10);

                    return [this.fooManager, "WithFactory"]
                }
            }


            injector = ioc.createContainer();
            injector.register(Rectangle);

            let injector2 = ioc.createContainer();

            injector2.register(FooManager);
            injector2.register(FooProvider);

            injector.addDefinition("barManager", {injector: injector2, refName: "fooProvider"});
            injector2.parent = injector;


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("FooManagerWithFactory");

        })


        it('should inject factory with alias ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() fooProvider: FooManager[];

                constructor() {

                }

                get name() {

                    return this.fooProvider;
                }

            }




            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<FooManager[]> {
                @injectAlias("test") fooManagers: FooManager[];

                constructor() {
                }

                public async get(): Promise<FooManager[]> {
                    await sleep(10);

                    return this.fooManagers
                }
            }

            @define()
            @singleton()
            @alias("test")
            class FooManager {


                public name: string;

                constructor() {
                    this.name = "FooManager"
                }

            }


            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooProvider);
            injector.register(FooManager);


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.length.should.be.eq(1);
            rectangle.name[0].name.should.be.eq("FooManager");

        })

        it('should inject factory with alias nested ', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() fooProvider: FooManager[];

                constructor() {

                }

                get name() {

                    return this.fooProvider;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<string> {
                @injectAlias("test") fooManagers: FooManager[];

                constructor() {
                }

                public async get(): Promise<string> {

                    return this.fooManagers[0].getName()
                }
            }

            @define()
            @singleton()
            @alias("test")
            class FooManager {

                @inject() barManager:BarManager


                @initMethod()
                getName() {
                   return this.barManager.name
                }

            }

            @define()
            @singleton()
            class BarManager {


                public name: string;

                constructor() {
                    this.name = "BarManager"
                }

            }


            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(FooProvider);
            injector.register(FooManager);
            injector.register(BarManager);


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("BarManager");

        })


        it('should inject factory with nested factory ref name', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooManager: FooManager;

                async get() {
                    await sleep(10);

                    return this.fooManager.working();
                }


            }


            @define()
            @singleton()
            class FooManager {
                @inject() fooProvider: { name: string };


                public working(): string {

                    return this.fooProvider.name;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<{ name: string }> {

                constructor() {
                }

                public async get(): Promise<{ name: string }> {
                    await sleep(10);

                    return {name: "working"}
                }
            }


            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector2.register(FooProvider);
            injector2.register(FooManager);


            injector.addDefinition("fooManager", {injector: injector2});


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("working");

        })

        it('should inject factory with nested  get alias', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            @injectorAware()
            class BooFactory implements IFactory<string> {

                @inject() fooManager: FooManager;
                @injectAlias("aaa") alias:any[]

                $injector:Injector

                async get() {
                    return _.map(this.$injector.getAlias("aaa").concat(this.alias),item=>item.working()).join(",")
                }


            }


            @define()
            @singleton()
            @alias("aaa")
            class FooManager {


                public working(): string {

                    return "FooManager"
                }

            }


            @define()
            @singleton()
            @alias("aaa")
            class FooManager2 {

                public working(): string {

                    return "FooManager2"
                }
            }


            injector = ioc.createContainer();

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector.register(FooManager2);
            injector.register(FooManager);




            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("FooManager2,FooManager,FooManager2,FooManager");

        })


        it('should inject factory values to alias', async () => {

            @define()
            @singleton()
            class Rectangle {

                @injectAlias("aaa") names:string[];


                get name() {

                    return this.names;
                }

            }

            @define()
            @singleton()
            @factory()
            @alias("aaa")
            class BooFactory implements IFactory<string> {

                async get() {
                    return "1"
                }


            }

            @define()
            @singleton()
            @factory()
            @alias("aaa")
            class BooFactory2 implements IFactory<string>{

                public get(): string {

                    return "2"
                }
            }


            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(BooFactory2);
            injector.register(BooFactory);




            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.join(",").should.be.eq("2,1");

        })



        it('should inject factory with nested factory', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooFooManager: FooManager;

                async get() {
                    await sleep(10);

                    return this.fooFooManager.working();
                }


            }


            @define()
            @singleton()
            class FooManager {
                @inject() fooManager2: FooManager2;


                public working(): string {

                    return this.fooManager2.working();
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: { name: string };


                public working(): string {

                    return this.fooProvider.name;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<{ name: string }> {

                constructor() {
                }

                public async get(): Promise<{ name: string }> {
                    await sleep(10);

                    return {name: "working"}
                }
            }


            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);


            injector.addDefinition("fooFooManager", {injector: injector2, refName: "fooManager"});


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("working");

        });

        it('should inject factory with nested factory same class', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooFooManager: FooManager;
                @inject() fooFooManager2: FooManager;

                async get() {
                    await sleep(10);

                    return this.fooFooManager.working() + this.fooFooManager2.working();
                }


            }


            @define()
            @singleton()
            class FooManager {
                @inject() fooManager2: FooManager2;


                public working(): string {

                    return this.fooManager2.working();
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: { name: string };


                public working(): string {

                    return this.fooProvider.name;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<{ name: string }> {

                constructor() {
                }

                public async get(): Promise<{ name: string }> {
                    await sleep(10);

                    return {name: "working"}
                }
            }


            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);


            injector.addDefinition("fooFooManager", {injector: injector2, refName: "fooManager"});
            injector.addDefinition("fooFooManager2", {injector: injector2, refName: "fooManager"});


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("workingworking");

        })


        it('should inject factory with nested factory not singleton', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooFooManager: FooManager;

                async get() {
                    await sleep(10);

                    return this.fooFooManager.working();
                }


            }


            @define()
            class FooManager {
                @inject() fooManager2: FooManager2;


                public working(): string {

                    return this.fooManager2.working();
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: { name: string };


                public working(): string {

                    return this.fooProvider.name;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<{ name: string }> {

                constructor() {
                }

                public async get(): Promise<{ name: string }> {
                    await sleep(10);

                    return {name: "working"}
                }
            }


            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);


            injector.addDefinition("fooFooManager", {injector: injector2, refName: "fooManager"});


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("working");

        })


        it('should inject factory with nested factory with init method', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: BooFactory[];


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooFooManager: FooManager;

                async get() {
                    await sleep(10);

                    return this.fooFooManager.working();
                }


            }


            @define()
            @singleton()
            class FooManager {
                @inject() fooManager2: FooManager2;

                private name: string

                @initMethod()
                init() {
                    this.name = "lalala"
                }


                public working(): string {

                    return this.fooManager2.working() + this.name;
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: { name: string };


                public working(): string {

                    return this.fooProvider.name;
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<{ name: string }> {

                constructor() {
                }

                public async get(): Promise<{ name: string }> {
                    await sleep(10);

                    return {name: "working"}
                }
            }


            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            injector2.parent = injector;

            injector.register(Rectangle);
            injector.register(BooFactory);

            injector2.register(FooProvider);
            injector2.register(FooManager);
            injector2.register(FooManager2);


            injector.addDefinition("fooFooManager", {injector: injector2, refName: "fooManager"});


            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("workinglalala");

        })


        it('should inject factory with nested factory flow', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: string;


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooManager: FooManager;
                @inject() logger: Logger;

                async get() {

                    return "1" + this.fooManager
                }

            }

            @define()
            @singleton()
            @factory()
            class Logger implements IFactory<string> {


                public get(): string {

                    return "logger"
                }

            }


            @define()
            @singleton()
            @factory()
            class FooManager implements IFactory<string> {
                @inject() fooManager2: FooManager2;


                public get(): string {

                    return "2" + this.fooManager2.name;
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: string;
                @inject() logger: Logger;


                public get name(): string {

                    return "3" + this.fooProvider
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<string> {

                constructor() {
                }

                public async get(): Promise<string> {

                    return "4"
                }
            }


            injector = ioc.createContainer();

            injector.registerMulti([Rectangle, BooFactory, FooProvider, FooManager, FooManager2, Logger]);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>(Rectangle);

            rectangle.name.should.be.eq("1234");

        });


        it('should inject factory with nested throw error circular reference', async () => {

            @define()
            @singleton()
            class Rectangle {

                @inject() booFactory: string;


                get name() {

                    return this.booFactory;
                }

            }

            @define()
            @singleton()
            @factory()
            class BooFactory implements IFactory<string> {

                @inject() fooManager: FooManager;
                @inject() logger: Logger;

                async get() {

                    return "1" + this.fooManager
                }

            }

            @define()
            @singleton()
            @factory()
            class Logger implements IFactory<string> {


                public get(): string {

                    return "logger"
                }

            }


            @define()
            @singleton()
            @factory()
            class FooManager implements IFactory<string> {
                @inject() fooManager2: FooManager2;


                public get(): string {

                    return "2" + this.fooManager2.name;
                }

            }

            @define()
            @singleton()
            class FooManager2 {
                @inject() fooProvider: string;
                @inject() booFactory: string;
                @inject() logger: Logger;


                public get name(): string {

                    return "3" + this.fooProvider
                }

            }


            @define()
            @singleton()
            @factory()
            class FooProvider implements IFactory<string> {

                constructor() {
                }

                public async get(): Promise<string> {

                    return "4"
                }
            }


            injector = ioc.createContainer();

            injector.registerMulti([Rectangle, BooFactory, FooProvider, FooManager, FooManager2, Logger]);

            try {
                await injector.initialize();

                let rectangle = injector.getObject<Rectangle>(Rectangle);

                rectangle.name.should.be.eq("1234");
            } catch (e) {
                e.message.should.be.eq("Factory circular reference booFactory-->fooManager-->fooManager2-->booFactory")
            }


        })


    });


    describe('inject factory Object to not singleton ', function () {


        it('should inject object after factory', async function () {

            let injector = ioc.createContainer();

            class Rectangle {
                manager: FooManager

                constructor() {

                }

                getName() {

                    return this.manager.name;
                }

            }

            class FooManager {
                name: any

                constructor() {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory {
                fooManager2: FooManager

                constructor() {

                }

                get() {
                    return this.fooManager2;
                }
            }


            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'manager',
                            factory: {id: 'fooManagerFactory'}
                        }
                    ]
                },
                fooManager2: {
                    type: FooManager,
                    singleton: true

                },
                fooManagerFactory: {
                    factory: true,
                    type: FooManagerFactory,
                    singleton: true,
                    inject: ['fooManager2']

                }
            });

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object', function () {


        it('should inject object with get object', async function () {

            let injector = ioc.createContainer();

            class LocalFooManager {
                name: string

                constructor() {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory implements IFactory<LocalFooManager> {
                localFooManager: LocalFooManager

                constructor() {

                }

                get() {
                    return this.localFooManager;
                }
            }

            injector.addDefinitions({

                localFooManager: {
                    type: LocalFooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true, factory: true,
                    inject: ['localFooManager']

                }
            });

            await injector.initialize();


            let fooManager = await injector.getFactory<LocalFooManager>('fooManagerFactory');

            should.exist(fooManager);

            fooManager.should.be.instanceof(LocalFooManager);

            fooManager.name.should.be.equal("foo");
        });
    });

    describe('inject 2 factories', function () {


        it('should inject object with get object', async function () {


            let injector = ioc.createContainer();

            class LocalFooManager {
                name: string;

                constructor() {
                    this.name = 'foo';
                }
            }

            class RemoteBarManager {
                name: string;

                constructor() {
                    this.name = 'bar';
                }
            }

            class FooManagerFactory implements IFactory<LocalFooManager> {
                localFooManager: any;

                constructor() {

                }

                get() {
                    return this.localFooManager;
                }
            }

            class BarManagerFactory implements IFactory<RemoteBarManager> {
                remoteBarManager: any;

                constructor() {

                }

                get() {
                    return this.remoteBarManager;
                }
            }

            class Rectangle {
                fooManager: LocalFooManager;
                barManager: RemoteBarManager;

                constructor() {

                }

                getName() {

                    return this.fooManager.name;
                }

                getName2() {

                    return this.barManager.name;
                }
            }


            injector.addDefinitions({

                localFooManager: {
                    type: LocalFooManager,
                    singleton: true

                },
                remoteBarManager: {
                    type: RemoteBarManager,
                    singleton: true

                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: ['localFooManager']

                },
                barManagerFactory: {
                    type: BarManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: ['remoteBarManager']
                },
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [{name: 'barManager', factory: {id: "barManagerFactory"}}, {
                        name: 'fooManager',
                        factory: {id: "fooManagerFactory"}
                    }]
                }
            });

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle);

            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);

            rectangle.fooManager.should.be.instanceof(LocalFooManager);
            rectangle.barManager.should.be.instanceof(RemoteBarManager);

            rectangle.getName().should.be.equal("foo");
            rectangle.getName2().should.be.equal("bar");
        });
    });


    describe('inject factory with same object name', function () {


        it('should inject object after factory', async function () {
            let injector = ioc.createContainer();

            class Rectangle {
                fooManager: FooManager

                constructor() {

                }

                getName() {

                    return this.fooManager.name;
                }

            }

            class FooManager {
                name: string

                constructor() {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory implements IFactory<FooManager> {
                fooManager: FooManager

                constructor() {

                }

                get() {
                    this.fooManager.name += "Factory";
                    return this.fooManager;
                }
            }


            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [{
                        name: 'fooManager',
                        factory: {id: "fooManagerFactory"}
                    }]


                },
                fooManager: {
                    type: FooManager,
                    singleton: true

                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    factory: true,
                    inject: ['fooManager']
                }
            });

            await injector.initialize();
            //var rectangle = injector.getObject('rectangle');
            var fooManagerFactory = injector.getObject<FooManagerFactory>('fooManagerFactory');
            var rectangle = injector.getObject<Rectangle>(Rectangle);

            should.exist(fooManagerFactory);

            should.exist(rectangle.fooManager);

            fooManagerFactory.should.be.instanceof(FooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.name.should.be.eq("fooFactory")
        });
    });
});


