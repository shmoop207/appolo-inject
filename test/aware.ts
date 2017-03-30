"use strict";
import chai = require('chai');
import    inject = require('../lib/inject');
import {Injector} from "../lib/inject";

let should = chai.should();

describe('Injector Aware',function(){

    describe('should inject injector to object', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

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

            injector.initialize();
        });

        it('should have the injected value', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.$injector);

            rectangle.$injector.should.be.equal(injector);
        });
    });




});

