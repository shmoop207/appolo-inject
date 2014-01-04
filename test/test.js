var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');


describe('Inject', function () {
    describe('basic container tests', function () {

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
    });

    describe('singleton object', function () {
        var injector;

        beforeEach(function(){
            injector = inject.createContainer();

            var Rectangle = Class.define({
                area: function () {
                    return 25;
                }
            });

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton:true
                }
            });

            injector.initialize();
        });

        it('should save object in instances', function () {
            should.exist(injector.getInstances()['rectangle']);
        });

        it('should get object', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });


    });
});