"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";

let should = chai.should();

describe('Injector Aware',function(){

    describe('should inject injector to object', function () {
        let injector:Injector;

        beforeEach(async function () {
            injector = ioc.createContainer();

           class Rectangle{

                constructor () {

                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    injectorAware:true
                }
            });

            await injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.$injector);

            rectangle.$injector.should.be.equal(injector);
        });
    });




});

