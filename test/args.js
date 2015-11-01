"use strict";

var should = require('chai').should(),
    inject = require('../lib/inject');

describe('Constructor Args', function () {


    describe('inject value  to constructor', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor(size) {
                    this.size = size;
                }

                area() {
                    return this.size;
                }
            }

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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject value  to constructor linq', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor(size) {
                    this.size = size;
                }

                area() {
                    return this.size;
                }
            }

            injector.define('rectangle',Rectangle).singleton().args({value: 25})

            injector.initialize();
        });

        it('should have the injected value', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject to constructor args', function () {
        var injector, FooManager, BarManager;

        beforeEach(function () {
            injector = inject.createContainer();


        })

        it('should have the injected constructor args ', function () {


            class Rectangle {

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            FooManager = class FooManager {

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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);


        });

        it('should have the injected constructor args link ', function () {


            class Rectangle {

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            FooManager = class FooManager {

                constructor() {

                }
            }

            injector.define('rectangle', Rectangle).singleton(true)
                .define('fooManager', FooManager).singleton(true)


            injector.initialize();

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);


        });


        it('should have the injected constructor singleton false ', function () {


            class Rectangle {

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            FooManager = class FooManager {

                constructor(barManager) {
                    this.barManager = barManager;
                }
            }

            BarManager = class BarManager {

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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);

            rectangle.fooManager.barManager.should.be.instanceof(BarManager);


        });

        it('should have the injected constructor Circular reference ', function () {


            class Rectangle {

                constructor(fooManager) {
                    this.fooManager = fooManager;
                }

                area() {
                    return this.size;
                }
            }


            FooManager = class FooManager {

                constructor(barManager) {
                    this.barManager = barManager;
                }
            }

            BarManager = class BarManager {

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

                constructor(fooManager, test) {
                    this.fooManager = fooManager;
                    this.test = test;
                }

                area() {
                    return this.size;
                }
            }


            FooManager = class FooManager {

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

            var rectangle = injector.getObject('rectangle', ['working']);

            should.exist(rectangle.fooManager);

            rectangle.fooManager.should.be.instanceof(FooManager);
            rectangle.test.should.be.eq("working");


        });
    });

    describe('inject value  to constructor', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor(size, name) {
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

            var rectangle = injector.getObject('rectangle', [null]);

            should.exist(rectangle.size);
            should.not.exist(rectangle.name);

            rectangle.area().should.equal(25);


        });

        it('should have the injected value and runtime value', function () {

            var rectangle = injector.getObject('rectangle', ['foo']);

            should.exist(rectangle.size);
            should.exist(rectangle.name);

            rectangle.area().should.equal(25);
            rectangle.name.should.equal('foo');

        });

    });


    describe('inject object  to constructor with runtime', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class {

                constructor(fooManager, name) {
                    this.fooManager = fooManager;
                    this.name = name + this.fooManager.name;
                }
            }

            var FooManager = class {

                constructor(name, barManager) {

                    this.barManager = barManager;

                    this.name = name + this.barManager.name;
                }


            }

            var BarManager = class {

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

            var rectangle = injector.getObject('rectangle', ['rectangle']);

            should.exist(rectangle.fooManager);
            should.exist(rectangle.fooManager.barManager);
            rectangle.name.should.equal('rectanglefoobar');
        });
    });

});

