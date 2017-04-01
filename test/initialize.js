"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let should = require('chai').should(), inject = require('../lib/inject');
describe('initialize', function () {
    describe('should call initialize method', function () {
        let injector, Rectangle;
        it('should call initialize method', function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                }
                initialize() {
                    this.working = true;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    initMethod: 'initialize'
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
    });
    describe('should call initialize method linq', function () {
        let injector;
        injector = inject.createContainer();
        class Rectangle {
            constructor() {
            }
            initialize() {
                this.working = true;
            }
        }
        injector.define('rectangle', Rectangle).singleton().initMethod('initialize');
        injector.initialize();
        it('should call initialize method', function () {
            let rectangle = injector.getObject('rectangle');
            rectangle.working.should.be.true;
        });
    });
});
//# sourceMappingURL=initialize.js.map