"use strict";
import {Injector} from "../lib/inject";
import ioc = require('../lib/inject');
import chai = require('chai');
import {define, singleton, inject} from "../lib/decorators";

let should = chai.should();

describe('Property Value',function(){


    describe('inject value to object', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = ioc.createContainer();

            class Rectangle{
                number:number
                size:number
                constructor () {
                    this.number = Math.random();
                }

                area () {
                    return this.size;
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    properties:[{
                        name:'size',
                        value:25
                    }]
                }
            });

            injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject value to object linq', function () {
        let injector:Injector;

        it('should have the injected value', function () {

            injector = ioc.createContainer();

            class Rectangle{
                number:number
                size:number

                constructor () {
                    this.number = Math.random();
                }

                area () {
                    return this.size;
                }
            }

            injector.register('rectangle',Rectangle).singleton().injectValue('size',25)

            injector.initialize();

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });




});

