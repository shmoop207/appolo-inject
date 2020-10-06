"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const ioc = require("../lib/inject");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
let should = chai.should();
describe('Property Dictionary', function () {
    describe('inject dictionary of objects', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                }
                getNames() {
                    return this.objects.foo.name + this.objects.bar.name + this.objects.baz;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class BarManager {
                constructor() {
                    this.name = 'bar';
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                    inject: [
                        {
                            name: 'objects',
                            dictionary: [
                                { key: 'foo', ref: 'fooManager' },
                                { key: 'bar', ref: 'barManager' },
                                { key: 'baz', value: 'baz' }
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
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.objects);
            rectangle.objects.should.be.an.instanceOf(Object);
            rectangle.objects.should.have.keys(['foo', 'baz', 'bar']);
            rectangle.getNames().should.equal('foobarbaz');
        });
    });
    describe('inject dictionary of objects linq', function () {
        let injector;
        beforeEach(function () {
            class Rectangle {
                constructor() {
                }
                getNames() {
                    return this.objects.foo.name + this.objects.bar.name + this.objects.baz;
                }
            }
            class FooManager {
                constructor() {
                    this.name = 'foo';
                }
            }
            class BarManager {
                constructor() {
                    this.name = 'bar';
                }
            }
            injector = ioc.createContainer();
            injector.register('rectangle', Rectangle)
                .injectDictionary('objects', [{ key: 'foo', ref: 'fooManager' }, { key: 'bar', ref: 'barManager' }, { key: 'baz', value: 'baz' }]);
            injector.register('fooManager', FooManager).singleton();
            injector.register('barManager', BarManager).singleton();
            injector.initialize();
        });
        it('should inject to object runtime and ref objects', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.objects);
            rectangle.objects.should.be.an.instanceOf(Object);
            rectangle.objects.should.have.keys(['foo', 'baz', 'bar']);
            rectangle.getNames().should.equal('foobarbaz');
        });
    });
});
//# sourceMappingURL=dictionary.js.map