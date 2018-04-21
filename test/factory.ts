"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import sleep  = require ('sleep-promise');
import {Injector} from "../lib/inject";
import {IFactory} from "../lib/IFactory";
import {define, factory, inject, injectFactory, singleton} from "../lib/decorators";

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
                            factory: 'fooManagerFactory'
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


        it.only('should inject multi factory async different containers', async () => {

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

        })

        it.only('should inject multi factory async parent container ', async () => {

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
                @inject() factory2: any;

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

            injector.startInitialize()


            injector2.startInitialize()


            await injector2.finishInitialize();
            await injector.finishInitialize();



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
                            factory: 'fooManagerFactory'
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
                    singleton: true,
                    inject: ['localFooManager']

                }
            });

            await injector.initialize();


            let fooManager = await injector.getFactory<LocalFooManager>('fooManager');

            should.exist(fooManager);

            fooManager.should.be.instanceof(LocalFooManager);

            fooManager.name.should.be.equal("foo");
        });
    });

    describe('inject 2 factories', function () {


        it('should inject object with get object', async function () {


            let injector = ioc.createContainer();

            class LocalFooManager {
                name: string

                constructor() {
                    this.name = 'foo';
                }
            }

            class RemoteBarManager {
                name: string

                constructor() {
                    this.name = 'bar';
                }
            }

            class FooManagerFactory implements IFactory<LocalFooManager> {
                localFooManager: any

                constructor() {

                }

                get() {
                    return this.localFooManager;
                }
            }

            class BarManagerFactory implements IFactory<RemoteBarManager> {
                remoteBarManager: any

                constructor() {

                }

                get() {
                    return this.remoteBarManager;
                }
            }

            class Rectangle {
                fooManager: LocalFooManager
                barManager: RemoteBarManager

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
                    inject: [{name: 'barManager', factory: "barManagerFactory"}, {
                        name: 'fooManager',
                        factory: "fooManagerFactory"
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
                        factory: "fooManagerFactory"
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

            should.exist(fooManagerFactory.fooManager);

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.fooManager.name.should.be.eq("fooFactory")
        });
    });
});


