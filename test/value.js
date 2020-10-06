"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioc = require("../lib/inject");
const chai = require("chai");
let should = chai.should();
describe('Property Value', function () {
    describe('inject value to object', function () {
        let injector;
        beforeEach(async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return this.size;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: [{
                            name: 'size',
                            value: 25
                        }]
                }
            });
            await injector.initialize();
        });
        it('should have the injected value', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.size);
            rectangle.area().should.equal(25);
        });
    });
    describe('inject value to object linq', function () {
        let injector;
        it('should have the injected value', async function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return this.size;
                }
            }
            injector.register('rectangle', Rectangle).singleton().injectValue('size', 25);
            await injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.size);
            rectangle.area().should.equal(25);
        });
    });
});
//# sourceMappingURL=value.js.map