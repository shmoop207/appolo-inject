"use strict";
"use strict";
import {Injector} from "../lib/inject";
let should = require('chai').should(),
    inject = require('../lib/inject');


describe('Property Ref', function () {

    describe('inject object by ref', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                calcManager:any
                constructor () {

                }

                area () {
                    return this.calcManager.calc();
                }
            }

            class CalcManager{

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    props: [
                        {
                            name: 'calcManager',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);

        });
    });

    describe('inject property with different name', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                calc:any
                constructor () {

                }

                area () {
                    return this.calc.calc();
                }
            }

            class CalcManager{

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    props: [
                        {
                            name: 'calc',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);

            should.not.exist(rectangle.CalcManager);

        });
    });



    describe('inject property with properties  def', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                calc:any
                constructor () {

                }

                area () {
                    return this.calc.calc();
                }
            }

            class CalcManager{

                constructor () {

                }

                calc () {
                    return 25
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'calc',
                            ref: 'calcManager'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property ', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);

            should.not.exist(rectangle.CalcManager);

        });
    });





    describe('inject property with inject array', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                fooManager:any;
                barManager:any;
                constructor () {

                }

                name () {
                    return this.fooManager.name() + this.barManager.name()
                }
            }

           class FooManager{

                constructor () {

                }

                name () {
                    return 'foo'
                }
            }

            class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: ['fooManager', 'barManager']
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property with inject array', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);

            rectangle.name().should.equal('foobar');
        });
    });

    describe('inject property with nested properties', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

             class Rectangle{
                 fooManager:any
                constructor () {

                }

                name () {
                    return this.fooManager.name()
                }
            }

            class FooManager{
                barManager:any
                constructor () {

                }

                name () {
                    return 'foo' + this.barManager.name()
                }
            }

            class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: ['fooManager']
                },
                fooManager: {
                    type: FooManager,
                    singleton: true,
                    inject: ['barManager']
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property with nested properties', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.not.exist(rectangle.barManager);
            should.exist(rectangle.fooManager.barManager);

            rectangle.name().should.equal('foobar');
        });
    });

    describe('inject property with inject array (object notation)', function () {
        let injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                fooManager:any
                myBarManager:any
                constructor () {

                }

                name () {
                    return this.fooManager.name() + this.myBarManager.name()
                }
            }

            class FooManager{

                constructor () {

                }

                name () {
                    return 'foo'
                }
            }

            class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: ['fooManager', { name: 'myBarManager', ref: 'barManager' }]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });

            injector.initialize();
        });

        it('should inject property with inject array', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.myBarManager);

            rectangle.name().should.equal('foobar');
        });
    });

    describe('inject property with nested properties link', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                fooManager:any
                constructor () {

                }

                name () {
                    return this.fooManager.name()
                }
            }

            class FooManager{
                barManager:any
                constructor () {

                }

                name () {
                    return 'foo' + this.barManager.name()
                }
            }

             class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }

            injector.define('rectangle',Rectangle).inject(['fooManager'])
                .define('fooManager',FooManager).inject('barManager')
                .define('barManager',BarManager);


            injector.initialize();
        });

        it('should inject property with nested properties', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.not.exist(rectangle.barManager);
            should.exist(rectangle.fooManager.barManager);

            rectangle.name().should.equal('foobar');
        });
    });


    describe('inject property with inject array (object notation) link', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                fooManager:any
                myBarManager:any
                constructor () {

                }

                name () {
                    return this.fooManager.name() + this.myBarManager.name()
                }
            }

            class FooManager{

                constructor () {

                }

                name () {
                    return 'foo'
                }
            }

            class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }


            injector.define('rectangle',Rectangle).inject('fooManager').inject('myBarManager','barManager')
                .define('fooManager',FooManager)
                .define('barManager',BarManager)

            injector.initialize();
        });

        it('should inject property with inject array', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.myBarManager);

            rectangle.name().should.equal('foobar');
        });
    });

    describe('inject property with inject space (object notation) link', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                fooManager:any
                barManager:any
                constructor () {

                }

                name () {
                    return this.fooManager.name() + this.barManager.name()
                }
            }

            class FooManager{

                constructor () {

                }

                name () {
                    return 'foo'
                }
            }

            class BarManager{

                constructor () {

                }

                name () {
                    return 'bar'
                }
            }


            injector.define('rectangle',Rectangle).inject('fooManager barManager')
                .define('fooManager',FooManager)
                .define('barManager',BarManager)

            injector.initialize();
        });

        it('should inject property with inject array', function () {

            let rectangle:any = injector.getObject('rectangle');
            should.exist(rectangle);
            should.exist(rectangle.fooManager);
            should.exist(rectangle.barManager);

            rectangle.name().should.equal('foobar');
        });
    });



});
