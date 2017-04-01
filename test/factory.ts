"use strict";
import chai = require('chai');
import    inject = require('../lib/inject');
import {Injector} from "../lib/inject";
import {IFactory} from "../lib/IFactory";

let should = chai.should();

describe('Property Factory', function () {

    describe('inject factory Object', function () {
        let injector:Injector;

        it('should inject object after factory', function () {

            injector = inject.createContainer();

            class Rectangle{
                manager:any
                constructor () {

                }
                getName () {

                    return this.manager.name;
                }

            }

            class FooManager{
                name:string
                constructor () {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory{
                fooManager2:any
                constructor () {

                }
                get () {
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
                    singleton: true,
                    inject: ['fooManager2']

                }
            });

            injector.initialize();

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object linq', function () {
        let injector:Injector, FooManager;

        it('should inject object after factory', function () {

            class Rectangle{
                manager:any
                constructor () {

                }
                getName () {

                    return this.manager.name;
                }

            }

            class FooManager{
                name:any
                constructor () {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory{
                fooManager2:any
                constructor () {

                }
                get () {
                    return this.fooManager2;
                }
            }

            injector = inject.createContainer()
            injector    .define('rectangle',Rectangle).singleton().injectFactory('manager','fooManagerFactory')
                .define('fooManager2',FooManager).singleton()
                .define('fooManagerFactory',FooManagerFactory).singleton().inject('fooManager2')
            injector  .initialize();

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });



    describe('inject factory Object to not singleton ', function () {


        it('should inject object after factory', function () {

            let injector = inject.createContainer();

            class Rectangle{
                manager:FooManager
                constructor () {

                }
                getName () {

                    return this.manager.name;
                }

            }

             class FooManager{
                name:any
                constructor () {
                    this.name = 'foo';
                }
            }

             class FooManagerFactory{
                fooManager2:FooManager
                constructor () {

                }
                get () {
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
                    type: FooManagerFactory,
                    singleton: true,
                    inject: ['fooManager2']

                }
            });

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object', function () {


        it('should inject object with get object', function () {

            let injector = inject.createContainer();

             class LocalFooManager{
                 name:string
                constructor () {
                    this.name = 'foo';
                }
            }

             class FooManagerFactory implements IFactory<LocalFooManager>{
                 localFooManager:LocalFooManager
                constructor () {

                }

                get () {
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

            injector.initialize();


            let fooManager = injector.getObject<LocalFooManager>('fooManager');

            should.exist(fooManager);

            fooManager.should.be.instanceof(LocalFooManager);

            fooManager.name.should.be.equal("foo");
        });
    });

    describe('inject 2 factories', function () {


        it('should inject object with get object', function () {


            let injector = inject.createContainer();

              class LocalFooManager{
                  name:string
                constructor () {
                    this.name = 'foo';
                }
            }

            class RemoteBarManager{
                name:string
                constructor () {
                    this.name = 'bar';
                }
            }

             class FooManagerFactory implements IFactory<LocalFooManager>{
                 localFooManager:any
                constructor () {

                }

                get () {
                    return this.localFooManager;
                }
            }

             class BarManagerFactory implements IFactory<RemoteBarManager>{
                remoteBarManager:any
                constructor () {

                }

                get () {
                    return this.remoteBarManager;
                }
            }

            class Rectangle{
                fooManager:LocalFooManager
                barManager:RemoteBarManager
                constructor () {

                }
                getName () {

                    return this.fooManager.name;
                }
                getName2 () {

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
                    inject: ['localFooManager']

                },
                barManagerFactory: {
                    type: BarManagerFactory,
                    singleton: true,
                    inject: ['remoteBarManager']
                },
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: ['barManager', 'fooManager']
                }
            });

            injector.initialize();

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


        it('should inject object after factory', function () {
            let injector = inject.createContainer();

           class Rectangle{
               fooManager:FooManager
                constructor () {

                }
                getName () {

                    return this.fooManager.name;
                }

            }

             class FooManager{
                name:string
                constructor () {
                    this.name = 'foo';
                }
            }

            class FooManagerFactory implements IFactory<FooManager>{
                fooManager:FooManager
                constructor () {

                }
                get () {
                    return this.fooManager;
                }
            }


            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: ['fooManager']


                },
                fooManager: {
                    type: FooManager,
                    singleton: true

                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    inject: ['fooManager']
                }
            });

            injector.initialize();
            //var rectangle = injector.getObject('rectangle');
            var fooManagerFactory = injector.getObject<FooManagerFactory>('fooManagerFactory');

            should.exist(fooManagerFactory.fooManager);

            //should.exist(rectangle.fooManager);

            //rectangle.fooManager.should.be.instanceof(FooManager);
        });
    });


});

