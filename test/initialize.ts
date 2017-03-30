"use strict";
import {Injector} from "../lib/inject";
let should = require('chai').should(),
    inject = require('../lib/inject');
describe('initialize', function () {


    describe('should call initialize method', function () {
        let injector:Injector, Rectangle;



        it('should call initialize method', function () {

            injector = inject.createContainer();

            class Rectangle{
                working:boolean
                constructor() {

                }

                initialize() {
                    this.working = true
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    initMethod: 'initialize'
                }
            });

            injector.initialize();

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

        });
    });

    describe('should call initialize method linq', function () {
        let injector:Injector;

        injector = inject.createContainer();

        class Rectangle{
            working:boolean
            constructor() {

            }

            initialize() {
                this.working = true
            }
        }

        injector.define('rectangle', Rectangle).singleton().initMethod('initialize')
            .initialize()


        it('should call initialize method', function () {

            let rectangle = injector.getObject<Rectangle>('rectangle');

            rectangle.working.should.be.true;

        });
    });


});

