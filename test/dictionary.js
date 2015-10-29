"use strict";
var should = require('chai').should(),
    inject = require('../lib/inject');

describe('Property Dictionary', function () {

    describe('inject dictionary of objects', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class{

                constructor () {

                }
                getNames () {


                    return this.objects.foo.name + this.objects.bar.name + this.objects.baz;
                }

            }

            var FooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            var BarManager = class{

                constructor () {
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
                            dictionary: [
                                {key:'foo',ref: 'fooManager'},
                                {key:'bar',ref: 'barManager'},
                                {key:'baz',value: 'baz'}
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

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.objects);
            rectangle.objects.should.be.an.instanceOf(Object);

            rectangle.objects.should.have.keys(['foo', 'baz','bar']);

            rectangle.getNames().should.equal('foobarbaz');
        });
    });

});

