"use strict";
var should = require('chai').should(),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    inject = require('../lib/inject');

describe('initialize',function(){


    describe('should call initialize method', function () {
        var injector,Rectangle;

        beforeEach(function () {
            injector = inject.createContainer();

            Rectangle = class{

                constructor () {

                }

                initialize () {
                    this.working = true
                }
            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    initMethod:'initialize'
                }
            });

            injector.initialize();
        });

        it('should call initialize method', function () {

            var rectangle = injector.getObject('rectangle');

            rectangle.working.should.be.true;

        });
    });




});

