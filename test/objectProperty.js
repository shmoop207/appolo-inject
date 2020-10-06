"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inject = require("../lib/inject");
const chai = require("chai");
let should = chai.should();
describe('Property Object Property.js', function () {
    describe('inject property from object property', function () {
        let injector;
        beforeEach(function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.otherObjectProperty;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'otherObjectProperty',
                            objectProperty: {
                                object: 'fooManager',
                                property: 'name'
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
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.otherObjectProperty);
            rectangle.getName().should.equal('foo');
        });
    });
    describe('inject property from object property linq', function () {
        let injector;
        beforeEach(function () {
            class Rectangle {
                constructor() {
                }
                getName() {
                    return this.otherObjectProperty;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            injector = inject.createContainer();
            injector.register('rectangle', Rectangle)
                .injectObjectProperty('otherObjectProperty', 'fooManager', 'name');
            injector.register('fooManager', FooManager).singleton();
            injector.initialize();
        });
        it('should inject to object runtime and ref objects', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.otherObjectProperty);
            rectangle.getName().should.equal('foo');
        });
    });
});
//# sourceMappingURL=objectProperty.js.map