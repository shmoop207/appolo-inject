"use strict";
var should = require('chai').should(),
    inject = require('../lib/inject');


describe('Alias Factory', function () {

    describe('should inject alias factory', function () {
        var injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            var calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            var calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(30);
        });

    });

    describe('should inject alias factory link', function () {
        var injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

                constructor (num) {
                    this.num = num || 25
                }

                calc () {
                    return this.num
                }
            }

            injector.define('rectangle',Rectangle).singleton().injectAliasFactory('calcable','calcable')
            injector.define('calcManager',CalcManager).aliasFactory(['calcable'])


            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            var calcable = rectangle.calcable[0]()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });


        it('should inject property with run time params', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            var calcable = rectangle.calcable[0](30)

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(30);
        });

    });


    describe('should inject alias factory link indexBy', function () {
        var injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Object);


            var calcable = rectangle.calcable.test()

            calcable.calc.should.be.a.Function;

            calcable.calc().should.be.eq(25);
        });




    });




});
