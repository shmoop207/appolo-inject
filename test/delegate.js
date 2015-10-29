"use strict";
var should = require('chai').should(),
    chai = require('chai'),
    inject = require('../lib/inject'),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe('delegate',function(){


    describe('delegate function', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class{

                constructor () {
                    this.number = Math.random();
                }

                run(){

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

        it('should delegate function', function () {

            var rectangle = injector.getObject('rectangle');

            var func = injector.delegate('rectangle');

            var spy = sinon.spy(rectangle,'run');

            func();

            spy.should.have.been.called;

        });

        it('should delegate function with params', function () {

            var rectangle = injector.getObject('rectangle');

            var func = injector.delegate('rectangle');

            var spy = sinon.spy(rectangle,'run');

            func("test","test2");

            spy.should.have.been.calledWithExactly("test","test2");

        });
    });




});

