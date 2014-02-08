var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');

describe('Property Factory Method', function () {

    describe('inject factory method', function () {
        var injector,FooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function () {

                },
                getName: function () {

                    return this.createFooManager();
                }

            });

            FooManager = Class.define({

                constructor: function () {
                    this.name = 'foo';
                }
            });



            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    properties: [
                        {
                            name: 'createFooManager',
                            factoryMethod: 'fooManager'
                        }
                    ]
                },
                fooManager: {
                    type: FooManager,
                    singleton: false

                }
            });

            injector.initialize();
        });

        it('should inject factory method that creates objects', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.createFooManager);
            rectangle.getName().should.be.instanceof(FooManager);
            rectangle.createFooManager.should.be.a('Function')


        });
    });

});

