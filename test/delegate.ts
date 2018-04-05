"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";
import    sinon = require("sinon");
import    sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe('delegate', function () {


    describe('delegate function', function () {
        let injector:Injector;

        class Rectangle{
            number:number;
            size:number;
            constructor() {
                this.number = Math.random();
            }

            run() {

            }

            area() {
                return this.size;
            }
        }

        beforeEach(function () {
            injector = ioc.createContainer();



            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    properties: [{
                        name: 'size',
                        value: 25
                    }]
                }
            });

            injector.initialize();
        });

        it('should delegate function', function () {

            let rectangle = injector.getObject<Rectangle>('rectangle');

            let func = injector.delegate('rectangle');

            let spy = sinon.spy<Rectangle>(rectangle, 'run');

            func();

            spy.should.have.been.called;

        });

        it('should delegate function with params', function () {

            var rectangle = injector.getObject<Rectangle>('rectangle');

            var func = injector.delegate('rectangle');

            var spy = sinon.spy<Rectangle>(rectangle, 'run');

            func("test", "test2");

            spy.should.have.been.calledWithExactly("test", "test2");

        });
    });


});

