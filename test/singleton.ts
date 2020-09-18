"use strict";
import {Injector} from "../lib/inject";
import ioc = require('../lib/inject');
import chai = require('chai');
import {define, singleton, inject} from "../lib/decorators";

let should = chai.should();
describe('Singleton', function () {


    describe('create singleton object',  function () {
        let injector: Injector;

        beforeEach(async function () {
            injector = ioc.createContainer();

            class Rectangle {
                number: number

                constructor() {
                    this.number = Math.random();
                }

                area() {
                    return 25;
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
                }
            });

            await injector.initialize();
        });

        it('should save object in instances', function () {
            should.exist(injector.getInstances()['rectangle']);
        });

        it('should get object', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });

        it('should have the same instance ', function () {

            let rectangle: any = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2: any = injector.getObject('rectangle');

            number.should.equal(rectangle2.number);

        });
    });

    describe('create singleton object with decorators', function () {
        let injector: Injector;

        beforeEach(async function () {
            injector = ioc.createContainer();

            @define()
            @singleton()
            class Rectangle {
                number: number

                constructor() {
                    this.number = Math.random();
                }

                area() {
                    return 25;
                }
            }

            injector.register(Rectangle)

            await injector.initialize();
        });

        it('should save object in instances', function () {
            should.exist(injector.getInstances()['rectangle']);
        });

        it('should get object', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });

        it('should have the same instance ', function () {

            let rectangle: any = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2: any = injector.getObject('rectangle');

            number.should.equal(rectangle2.number);

        });
    });

    describe('create not singleton object', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = ioc.createContainer();

            class Rectangle {
                number: number

                constructor() {
                    this.number = Math.random();
                }

                area() {
                    return 25;
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false
                }
            });

            injector.initialize();
        });

        it('should save object in instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });

        it('should get object', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });

        it('should have the same instance ', function () {

            let rectangle: any = injector.getObject('rectangle');
            let number = rectangle.number;
            let rectangle2: any = injector.getObject('rectangle');

            number.should.not.equal(rectangle2.number);

        });
    });


});

