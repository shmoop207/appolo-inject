"use strict";
import {Injector} from "../lib/inject";
import inject = require('../lib/inject');
import chai = require('chai');

let should = chai.should();


describe('Property Object Property.js', function () {

    describe('inject property from object property', function () {
        let injector:Injector;

        beforeEach(function () {
            injector = inject.createContainer();

            class Rectangle{
                otherObjectProperty:string
                constructor () {

                }
                getName () {

                    return this.otherObjectProperty;
                }

            }

            class FooManager{
                name:string
                constructor () {
                    this.name = 'foo';
                }
            }



            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'otherObjectProperty',
                            objectProperty: {
                                object:'fooManager',
                                property:'name'
                            }
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true

                }
            });

            injector.initialize();
        });

        it('should inject to object runtime and ref objects', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.otherObjectProperty);

            rectangle.getName().should.equal('foo');
        });
    });

    describe('inject property from object property linq', function () {
        let injector:Injector

        beforeEach(function () {


            class Rectangle{
                otherObjectProperty:string
                constructor () {

                }
                getName () {

                    return this.otherObjectProperty;
                }

            }

             class FooManager{
                name:string
                constructor () {
                    this.name = 'foo';
                }
            }


            injector = inject.createContainer()
            injector.register('rectangle',Rectangle)
                .injectObjectProperty('otherObjectProperty','fooManager','name')
            injector.register('fooManager',FooManager).singleton()
            injector .initialize();
        });

        it('should inject to object runtime and ref objects', function () {

            let rectangle:any = injector.getObject('rectangle');

            should.exist(rectangle.otherObjectProperty);

            rectangle.getName().should.equal('foo');
        });
    });

});

