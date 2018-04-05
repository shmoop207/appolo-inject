"use strict";
import {Injector} from "../lib/inject";
import    ioc = require('../lib/inject');
import chai = require('chai');

let should = chai.should();

describe('Lazy', function () {


    describe('create lazy object', function () {
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

            injector.register('rectangle', Rectangle).singleton().lazy()


            injector.initialize();
        });

        it('should not exist instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });

        it('should created lazy', function () {
            let rectangle: any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });

        it('should created lazy once', function () {
            let rectangle: any = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);

            let r = rectangle.number;
            let r2 = injector.getObject<any>('rectangle').number;

            r.should.be.eq(r2)
        });

    });

});

