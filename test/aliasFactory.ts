"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";
import {
    aliasFactory,
    define,
    dynamicFactory,
    alias,
    factoryMethod, aliasFactoryMap
} from "../lib/decorators";

let should = chai.should();


describe('Alias Factory', function () {

    describe('should inject alias factory', function () {
        let injector,CalcManager;

        beforeEach(async function () {
            injector = ioc.createContainer();

            let Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {
                num:number
                constructor (num) {
                    this.num = num || 25
                }

                calc () {
                    return this.num
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [
                        {
                            name: 'calcable',
                            aliasFactory: 'calcable'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    aliasFactory:['calcable'],
                    singleton: false
                }
            });

            await injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a('function');

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            let rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a('function');

            calcable.calc().should.be.eq(30);
        });

    });

    describe('should inject alias factory link', function () {
        let injector:Injector,CalcManager;

        beforeEach(async function () {
            injector = ioc.createContainer();

            let Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {
                num:number;
                constructor (num) {
                    this.num = num || 25
                }

                calc () {
                    return this.num
                }
            }

            injector.register('rectangle',Rectangle)
                .singleton()
                .injectAliasFactory('calcable','calcable')

            injector.register('calcManager',CalcManager).aliasFactory(['calcable'])


            await injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a('function');

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a('function');

            calcable.calc().should.be.eq(30);
        });

    });


    describe('should inject alias factory link indexBy', function () {
        let injector:Injector,CalcManager;

        beforeEach(async function () {
            injector = ioc.createContainer();

            let Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {
                num:number;
                static get NAME(){

                    return "test";
                }

                constructor (num) {
                    this.num = num || 25


                }

                calc () {
                    return this.num
                }
            }

            injector.register('rectangle',Rectangle).singleton().injectAliasFactory('calcable','calcable',"NAME")
            injector.register('calcManager',CalcManager).aliasFactory(['calcable']);


            await injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Object);


            let calcable = rectangle.calcable.test()

            calcable.calc.should.be.a('function');

            calcable.calc().should.be.eq(25);
        });




    });

    describe('inject factory alias with dynamic factory', function () {
        let injector:Injector, FooManager;


        it('should inject factory alias with dynamic factory', async function () {
            injector = ioc.createContainer();


            @define()
            class BooManager{

                constructor(public name2:string) {

                }
            }
            @define()
            @dynamicFactory()
            @aliasFactory("test")
            class FooManager{

                @factoryMethod(BooManager) createFooManager: (name:string)=>FooManager;
                constructor(public name:string) {

                }

                async get(){
                    return this.createFooManager(this.name);
                }

            }



            @define()
            class Rectangle {
                @aliasFactory("test") createFooManager: ((name:string)=>BooManager)[];
                @aliasFactoryMap("test",(item)=>item.name) createFooManagerMap: Map<string,(name:string)=>BooManager>;


                constructor() {

                }
                async getName(name) {

                    let a =   await this.createFooManager[0](name)
                    return a.name2;
                }
            }


            injector.registerMulti([FooManager,Rectangle,BooManager]);

            await injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.createFooManager);

            rectangle.createFooManager.should.be.a('Array');
            rectangle.createFooManager.length.should.eq(1);

            //rectangle.createFooManager[0]("boo").should.be.instanceof(BooManager);

            let a = await rectangle.getName("boo")

            a.should.be.eq("boo")

             rectangle.createFooManagerMap.should.be.instanceOf(Map)

            let result = await rectangle.createFooManagerMap.get("FooManager")("boo")
            result.name2.should.be.eq("boo")


        });
    });




});
