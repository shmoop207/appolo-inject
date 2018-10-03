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

            constructor(private _name:string) {
            }

            public get name(){
                return this._name;
            }


        }

        beforeEach(function () {
            injector = ioc.createContainer();



            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,

                }
            });

            injector.initialize();
        });

        it('should delegate function', function () {


            let func = injector.getFactoryMethod(Rectangle)

            let obj = func("test");

            obj.name.should.be.eq("test")

        });

    });


});

