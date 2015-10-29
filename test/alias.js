"use strict";
var should = require('chai').should(),
    inject = require('../lib/inject');


describe('Alias', function () {

    describe('should inject alias', function () {
        var injector,CalcManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor () {

                }
            };

            CalcManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }
            };

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    props: [
                        {
                            name: 'calcable',
                            alias: 'calcable'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    alias:['calcable'],
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);

            rectangle.calcable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(1);

            rectangle.calcable[0].should.be.an.instanceOf(CalcManager);

            rectangle.calcable[0].calc.should.be.a.Function;
        });

        it('should getAlias', function () {
            var calcable = injector.getAlias('calcable');

            should.exist(calcable);

            calcable.should.be.an.instanceOf(Array);

            calcable.length.should.be.equal(1);

            calcable[0].should.be.an.instanceOf(CalcManager);

            calcable[0].calc.should.be.a.Function;
        });

        it('should getAlias return empty array if not found', function () {
            var calcable = injector.getAlias('calcable2');

            should.exist(calcable);

            calcable.should.be.an.instanceOf(Array);

            calcable.length.should.be.equal(0);
        });
    });

    describe('should inject multi alias', function () {
        var injector,CalcManager,FooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            FooManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }

                cleanable(){

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    props: [
                        {
                            name: 'calcable',
                            alias: 'calcable'
                        },
                        {
                            name: 'cleanable',
                            alias: 'cleanable'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    alias:['calcable'],
                    singleton: true
                },

                fooManager: {
                    type: FooManager,
                    alias:['calcable','cleanable'],
                    singleton: true
                },

                barManager: {
                    type: CalcManager,
                    alias:['calcable'],
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);

            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);

        });
    });





    describe('should inject multi alias by class type', function () {
        var injector,CalcManager,FooManager;

        beforeEach(function () {
            injector = inject.createContainer();


            var Cleanable = class {

                constructor () {

                }
            }


            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            FooManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }

                cleanable(){

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    props: [
                        {
                            name: 'calcable',
                            alias: 'calcable'
                        },
                        {
                            name: 'cleanable',
                            alias: Cleanable
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    alias:['calcable'],
                    singleton: true
                },

                fooManager: {
                    type: FooManager,
                    alias:['calcable',Cleanable],
                    singleton: true
                },

                barManager: {
                    type: CalcManager,
                    alias:['calcable'],
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);

            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);

        });
    });



    describe('should inject multi alias by class type linq', function () {
        var injector,CalcManager,FooManager;

        beforeEach(function () {
            injector = inject.createContainer();


            var Cleanable = class {

                constructor () {

                }
            }


            var Rectangle = class {

                constructor () {

                }
            }

            CalcManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            FooManager = class {

                constructor () {

                }

                calc () {
                    return 25
                }

                cleanable(){

                }
            }

            injector.define('rectangle',Rectangle).singleton().injectAlias('calcable','calcable').injectAlias('cleanable',Cleanable)
                .define('calcManager',CalcManager).alias('calcable').singleton()
                .define('fooManager',FooManager).alias(['calcable',Cleanable]).singleton()
                .define('barManager',CalcManager).alias(['calcable']).singleton()

            injector.initialize();
        });

        it('should inject property ', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.calcable);
            should.exist(rectangle.cleanable);

            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.cleanable.should.be.an.instanceOf(Array);

            rectangle.calcable.length.should.be.equal(3);
            rectangle.cleanable.length.should.be.equal(1);

        });
    });






});
