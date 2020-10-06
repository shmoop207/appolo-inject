"use strict";
import {Injector} from "../lib/inject";
import ioc = require('../lib/inject');
import chai = require('chai');
import {define, singleton, inject} from "../lib/decorators";

let should = chai.should();

describe('Property Value',function(){


    describe('inject value to object', function () {
        let injector:Injector;

        beforeEach(async function () {
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
                    inject:[{
                        name:'size',
                        value:25
                    }]
                }
            });

            await injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject value to object linq', function () {
        let injector:Injector;

        it('should have the injected value', async function () {

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

            await injector.initialize();

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });




});

