"use strict";
import chai = require('chai');
import    inject = require('../lib/inject');
import {Injector} from "../lib/inject";

let should = chai.should();


describe('Alias Factory', function () {

    describe('should inject alias factory', function () {
        let injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

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
                    props: [
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

            injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            let rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(30);
        });

    });

    describe('should inject alias factory link', function () {
        let injector:Injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

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

            injector.define('rectangle',Rectangle)
                .singleton()
                .injectAliasFactory('calcable','calcable')

            injector.define('calcManager',CalcManager).aliasFactory(['calcable'])


            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            let calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(30);
        });

    });


    describe('should inject alias factory link indexBy', function () {
        let injector:Injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

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

            injector.define('rectangle',Rectangle).singleton().injectAliasFactory('calcable','calcable',"NAME")
            injector.define('calcManager',CalcManager).aliasFactory(['calcable'])


            injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Object);


            let calcable = rectangle.calcable.test()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });




    });




});
