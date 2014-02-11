var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');


describe('Ioc', function () {
    describe('create ioc', function () {

        it('should crate empty Ioc', function () {
            var injector = inject.createContainer();

            should.exist(injector.getInstances());
        });

        it('should add add definitions', function () {
            var injector = inject.createContainer();

            injector.addDefinitions({
                test: {
                    type: 'test'
                }
            });

            should.exist(injector.getDefinition('test'));
        });

        it('should add duplicate definitions', function () {
            var injector = inject.createContainer();


            (function () {

                injector.addDefinitions({
                    test: {
                        type: 'test'
                    }
                });

                injector.addDefinitions({
                    test: {
                        type: 'test'
                    }
                })
            }).should.throw("Injector:definition id already exists:test")
        });
    });

    describe('get simple object', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function () {

                }
            });

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle
                }
            });

            injector.initialize();
        });


        it('should get object', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle);
        });
    });

    describe('get simple object error', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function () {

                }
            });

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle
                }
            });

            injector.initialize();
        });


        it('should throw error if object not found', function () {

            (function () {
                var rectangle = injector.getObject('rectangle2');
            }).should.throw("Injector:can't find object definition for objectID:rectangle2")


        });
    });
});