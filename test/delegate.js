"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const ioc = require("..");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
describe('delegate', function () {
    describe('delegate function', function () {
        let injector;
        class Rectangle {
            constructor(_name) {
                this._name = _name;
            }
            get name() {
                return this._name;
            }
        }
        beforeEach(function () {
            injector = ioc.createContainer();
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: false,
                }
            });
            injector.initialize();
        });
        it('should delegate function', function () {
            let func = injector.getFactoryMethod(Rectangle);
            let obj = func("test");
            obj.name.should.be.eq("test");
        });
    });
});
//# sourceMappingURL=delegate.js.map