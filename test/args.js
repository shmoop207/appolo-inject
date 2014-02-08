var should = require('chai').should(),
    Class = require('appolo-class'),
    inject = require('../lib/inject');

describe('Args Value',function(){


    describe('inject value  to constructor', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function (size) {
                    this.size = size;
                },

                area: function () {
                    return this.size;
                }
            });

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    args:[{
                        value:25
                    }]
                }
            });

            injector.initialize();
        });

        it('should have the injected value', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.size);

            rectangle.area().should.equal(25);

        });
    });

    describe('inject value  to constructor', function () {
        var injector;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = Class.define({

                constructor: function (size,name) {
                    this.size = size;
                    this.name = name;
                },

                area: function () {
                    return this.size;
                }
            });

            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true
//                    args:[{
//                        value:25
//                    }]
                }
            });

            injector.initialize();
        });

        it('should have the injected value and runtime value', function () {

            var rectangle = injector.getObject('rectangle',['foo']);

            should.exist(rectangle.size);
            //should.exist(rectangle.name);

            rectangle.area().should.equal(25);
            //rectangle.name.should.equal('foo');

        });
    });




});

