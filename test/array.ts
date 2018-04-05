"use strict";
import chai = require('chai');
import    ioc = require('../lib/inject');
import {Injector} from "../lib/inject";

let should = chai.should();
describe('Property Array', function () {

    describe('inject array of objects', function () {
        let injector: Injector;

        beforeEach(function () {
            injector = ioc.createContainer();

            let Rectangle = class {
                objects: any[]

                constructor() {

                }

                getNames() {

                    let name = ""
                    this.objects.forEach(function (object) {
                        name += object.name
                    });

                    return name;
                }

            }

            class FooManager {
                name: string

                constructor() {

                    this.name = 'foo';
                }


            }

            class BarManager {
                name: string

                constructor() {
                    this.name = 'bar';
                }

            }

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'objects',
                            array: [
                                {ref: 'fooManager'},
                                {ref: 'barManager'}
                            ]
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    singleton: true

                },
                barManager: {
                    type: BarManager,
                    singleton: true

                }
            });

            injector.initialize();
        });

        it('should inject to object runtime and ref objects', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.objects);
            rectangle.objects.should.be.an.instanceOf(Array);
            rectangle.objects.should.have.length(2);
            rectangle.getNames().should.equal('foobar');
        });
    });

    describe('inject array of objects linq', function () {
        let injector: Injector;

        beforeEach(function () {

            class Rectangle {
                objects: any[];

                constructor() {

                }

                getNames() {

                    let name = ""
                    this.objects.forEach(function (object) {
                        name += object.name
                    });

                    return name;
                }

            }

            class FooManager {
                name: string

                constructor() {

                    this.name = 'foo';
                }


            }

            class BarManager {
                name: string;

                constructor() {
                    this.name = 'bar';
                }

            }


            injector = ioc.createContainer()

            injector.register('rectangle', Rectangle)
                .injectArray('objects', [{ref: 'fooManager'}, {ref: 'barManager'}])
            injector.register('fooManager', FooManager).singleton()
            injector.register('barManager', BarManager).singleton()


            injector.initialize()
        });

        it('should inject to object runtime and ref objects', function () {

            let rectangle: any = injector.getObject('rectangle');

            should.exist(rectangle.objects);
            rectangle.objects.should.be.an.instanceOf(Array);
            rectangle.objects.should.have.length(2);
            rectangle.getNames().should.equal('foobar');
        });
    });

});

