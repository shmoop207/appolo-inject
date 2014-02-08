var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');


describe('Inject', function () {
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
    });
});