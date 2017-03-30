"use strict";
import chai = require('chai');
import    inject = require('../lib/inject');
import {Injector} from "../lib/inject";

let should = chai.should();


describe('Constructor Args', function () {


    describe('inject value  to constructor', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            let Rectangle = class {
                size: number;

                constructor(size) {
                    this.size = size;
                }

                area() {
                    return this.size;
                }
            };

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    args: [{
                        value: 25
                    }]
                }
            });

            injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject value  to constructor linq', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            let Rectangle = class {
                size: number;

                constructor(size) {
                    this.size = size;
                }

                area() {
                    return this.size;
                }
            };

            injector.define('rectangle', Rectangle).singleton().args({value: 25})

            injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject to constructor args', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = inject.createContainer();


        });

        it('should have the injected constructor args ', function () {


            class Rectangle {
                public size: number;
                public fooManager: FooManager;

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            class FooManager {

                constructor() {

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                }
            });

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);


        });

        it('should have the injected constructor args link ', function () {


            class Rectangle {
                fooManager: FooManager
                size: number

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            class FooManager {

                constructor() {

                }
            }

            injector.define('rectangle', Rectangle).singleton(true)
                .define('fooManager', FooManager).singleton(true)


            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);


        });


        it('should not inject without constructor args ', function () {


            class Rectangle {
                size: number

                area(fooManager) {
                    return this.size;
                }
            }


            class FooManager {

                constructor() {
                    throw new Error("aaa")
                }
            }

            injector.define('rectangle', Rectangle).singleton(true)
                .define('fooManager', FooManager)

            should.not.throw(() => {
                injector.initialize();

                let rectangle = injector.getObject('rectangle');


            })
        });


        it('should have the injected constructor singleton false ', function () {


            class Rectangle {
                fooManager: FooManager
                size: number

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            class FooManager {
                barManager: BarManager

                constructor(barManager) {
                    this.barManager = barManager;
                }
            }

            class BarManager {

                constructor() {

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                },
                fooManager: {
                    type: FooManager,
                    singleton: false
                },
                barManager: {
                    type: BarManager,
                    singleton: true
                }
            });

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);

            rectangle.fooManager.barManager.should.be.instanceof(BarManager);


        });

        it('should have the injected constructor Circular reference ', function () {


            class Rectangle {
                fooManager: FooManager;
                size: number

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            class FooManager {
                barManager: BarManager

                constructor(barManager) {
                    this.barManager = barManager;
                }
            }

            class BarManager {

                constructor(rectangle) {

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
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

            (function () {
                injector.initialize()
            }).should.throw(/^Circular reference/);
        });

        it('should have the injected constructor args with runtime args ', function () {


            class Rectangle {
                fooManager: FooManager;
                size: number
                test: string

                constructor(fooManager, test) {
                    this.fooManager = fooManager;
                    this.test = test;
                }

                area() {
                    return this.size;
                }
            }


            class FooManager {

                constructor() {

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                }
            });

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle', ['working']);

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.test.should.be.eq("working");


        });
    });

    describe('inject value  to constructor', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle {
                size: number
                name: string

                constructor(size: number, name: string) {
                    this.size = size;
                    this.name = name;
                }

                area() {
                    return this.size;
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    args: [{
                        value: 25
                    }]
                }
            });

            injector.initialize();
        });

        it('should have the injected value null', function () {

            let rectangle: any = injector.getObject('rectangle', [null]);

            should.exist(rectangle.size);
            should.not.exist(rectangle.name);

            rectangle.area().should.equal(25);


        });

        it('should have the injected value and runtime value', function () {

            let rectangle: any = injector.getObject('rectangle', ['foo']);

            should.exist(rectangle.size);
            should.exist(rectangle.name);

            rectangle.area().should.equal(25);
            rectangle.name.should.equal('foo');

        });

    });


    describe('inject object  to constructor with runtime', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle {
                fooManager:FooManager
                name:string
                constructor(fooManager, name) {
                    this.fooManager = fooManager;
                    this.name = name + this.fooManager.name;
                }
            }

            class FooManager {
                barManager:BarManager
                name:string
                constructor(name, barManager) {

                    this.barManager = barManager;

                    this.name = name + this.barManager.name;
                }


            }

            class BarManager{
                name:string
                constructor(name) {
                    this.name = name;
                }

            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    args: [{
                        ref: 'fooManager'
                    }]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true,
                    args: [{
                        value: 'foo'
                    }, {
                        ref: 'barManager'
                    }]
                },
                barManager: {
                    type: BarManager,
                    singleton: true,
                    args: [{
                        value: 'bar'
                    }]
                }
            });

            injector.initialize();
        });

        it('should inject to object runtime and ref objects', function () {

            let rectangle:any = injector.getObject('rectangle', ['rectangle']);

            should.exist(rectangle.fooManager);
            should.exist(rectangle.fooManager.barManager);
            rectangle.name.should.equal('rectanglefoobar');
        });
    });

})
;

