"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../index");
const define_1 = require("../lib/decorators/define");
const singleton_1 = require("../lib/decorators/singleton");
const lazy_1 = require("../lib/decorators/lazy");
const inject_1 = require("../lib/decorators/inject");
const factory_1 = require("../lib/decorators/factory");
let should = chai.should();
describe('Wire', function () {
    describe('should wire class', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
        });
        it('should wire class ', async function () {
            let injector1 = ioc.createContainer();
            let injector2 = ioc.createContainer();
            let B = class B {
                name() {
                    return "B";
                }
            };
            B = tslib_1.__decorate([
                define_1.define(),
                singleton_1.singleton()
            ], B);
            let C = class C {
                get() {
                    return "C";
                }
            };
            C = tslib_1.__decorate([
                define_1.define(),
                singleton_1.singleton(),
                factory_1.factory()
            ], C);
            let A = class A {
                constructor(a) {
                }
            };
            tslib_1.__decorate([
                lazy_1.lazy()
            ], A.prototype, "b", void 0);
            tslib_1.__decorate([
                inject_1.inject()
            ], A.prototype, "c", void 0);
            A = tslib_1.__decorate([
                define_1.define()
            ], A);
            injector1.register(B);
            injector2.register(C);
            injector1.parent = injector2;
            await injector1.initialize();
            await injector2.initialize();
            let rectangle = injector1.wire(A, ["1"]);
            should.exist(rectangle.b);
            rectangle.b.name().should.be.eq("B");
            rectangle.c.should.be.eq("C");
        });
    });
});
//# sourceMappingURL=wire.js.map