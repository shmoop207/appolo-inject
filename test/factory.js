var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');

describe('Property Factory', function () {

    describe('inject factory Object', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function () {

                },
                getName: function () {

                    return this.manager.name;
                }

            });

            var FooManager = Class.define({

                constructor: function () {
                    this.name = 'foo';
                }
            });

            var FooManagerFactory = Class.define({

                constructor: function () {

                },
                get:function(){
                    return this.fooManager2;
                }
            });



            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    properties: [
                        {
                            name: 'manager',
                            factory: 'fooManagerFactory'
                        }
                    ]
                },
                fooManager2: {
                    type: FooManager,
                    singleton: true

                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    inject:['fooManager2']

                }
            });

            injector.initialize();
        });

        it('should inject object after factory', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            //rectangle.getName().should.be.instanceof(FooManager);
            //rectangle.createFooManager.should.be.a('Function')


        });
    });

});

