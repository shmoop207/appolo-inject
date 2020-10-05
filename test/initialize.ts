"use strict";
import {Injector} from "../lib/inject";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {define, singleton, initMethod, initMethodAsync, bootstrapMethod, bootstrapMethodAsync} from "../lib/decorators";

let should = chai.should();

describe('initialize', function () {


    describe('should call initialize method', function () {
        let injector: Injector, Rectangle;


        it('should call initialize method', async function () {

            injector = ioc.createContainer();

            class Rectangle {
                working: boolean

                constructor() {

                }

                initialize() {
                    this.working = true
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    initMethod: 'initialize'
                }
            });

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

        });
    });

    describe('should call initialize method linq', function () {
        let injector: Injector;


        it('should call initialize method', async function () {

            injector = ioc.createContainer();

            class Rectangle {
                working: boolean

                constructor() {

                }

                initialize() {
                    this.working = true
                }
            }

            injector.register('rectangle', Rectangle).singleton().initMethod('initialize')
            await injector.initialize()


            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

        });
    });

    describe('should call initialize method decorators', function () {


        it('should call initialize method', async function () {

            let injector: Injector;

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Rectangle {
                working: boolean;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.working = true
                }
            }

            injector.register(Rectangle);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

        });


        it('should call bootstrap method', async function () {

            let injector: Injector;

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Rectangle {
                working: boolean;
                working2: boolean;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.working = true
                }

                @bootstrapMethod()
                bootstrap() {
                    this.working2 = true
                }
            }

            injector.register(Rectangle);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;
            rectangle.working2.should.be.true;

        });


        it('should call fire create event', async function () {

            let injector: Injector;

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Rectangle {
                working: boolean;

                constructor() {

                }

                @initMethod()
                initialize() {
                    this.working = true
                }
            }

            injector.register(Rectangle);

            let req;

            injector.events.instanceInitialized.on(action => {
                req = action.instance;
            })

            await injector.initialize();


            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

            req.should.be.equal(rectangle)

        });

    });


    describe('should call initialize method decorators', function () {


        it('should call initialize method async ', async function () {

            let injector: Injector;

            injector = ioc.createContainer();

            @define()
            @singleton()
            class Rectangle {
                working: string;
                working2: string;

                constructor() {

                }

                @initMethodAsync()
                async initialize() {

                    await new Promise(resolve => setTimeout(() => resolve(), 1));

                    this.working = "aa"
                }

                @bootstrapMethodAsync()
                async bootstrap() {

                    await new Promise(resolve => setTimeout(() => resolve(), 1));

                    this.working2 = this.working+"bb"
                }
            }

            injector.register(Rectangle);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.eq("aa");
            rectangle.working2.should.be.eq("aabb");

        });
    });


});

