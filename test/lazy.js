"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const __1 = require("../");
const ioc = require("..");
const chai = require("chai");
let should = chai.should();
describe('Lazy', function () {
    describe('inject lazy fn', function () {
        let injector;
        it('should inject lazy fn', function () {
            injector = ioc.createContainer();
            let Test = class Test {
            };
            tslib_1.__decorate([
                __1.inject()
            ], Test.prototype, "testLazy", void 0);
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            injector.register('test', Test);
            injector.addDefinition("testLazy", {
                lazyFn: () => {
                    return "working";
                }
            });
            injector.initialize();
            let test = injector.getObject('test');
            test.testLazy.should.be.eq("working");
            let test2 = injector.getObject('testLazy');
            test2.should.be.eq("working");
        });
        it('should inject lazy fn to class', function () {
            injector = ioc.createContainer();
            let Test = class Test {
            };
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            injector.register('test', Test).injectLazyFn("test", function (inject) {
                return "working";
            });
            injector.initialize();
            let test = injector.getObject('test');
            test.test.should.be.eq("working");
        });
        it('should custom inject lazy fn to class', function () {
            injector = ioc.createContainer();
            let customDecorator = function (id) {
                return __1.customFn((inject) => {
                    return inject.get(id).name;
                });
            };
            let Test2 = class Test2 {
                constructor() {
                    this.name = "bbb";
                }
            };
            Test2 = tslib_1.__decorate([
                __1.define()
            ], Test2);
            let Test = class Test {
            };
            tslib_1.__decorate([
                customDecorator("test2")
            ], Test.prototype, "test", void 0);
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            injector.registerMulti([Test, Test2]);
            injector.initialize();
            let test = injector.getObject('test');
            test.test.should.be.eq("bbb");
        });
        it('should custom inject lazy fn to class nested parent', function () {
            injector = ioc.createContainer();
            let injector2 = ioc.createContainer();
            let customDecorator = function (id) {
                return __1.customFn((inject) => {
                    return injector2.get(id).name;
                });
            };
            let Test2 = class Test2 {
                constructor() {
                    this.name = "bbb";
                }
            };
            Test2 = tslib_1.__decorate([
                __1.define()
            ], Test2);
            let Test = class Test {
            };
            tslib_1.__decorate([
                customDecorator("test2")
            ], Test.prototype, "test", void 0);
            Test = tslib_1.__decorate([
                __1.define()
            ], Test);
            injector2.parent = injector;
            injector2.register(Test2);
            injector.registerMulti([Test]);
            injector.initialize();
            let test = injector.getObject('test');
            test.test.should.be.eq("bbb");
        });
    });
    describe('create lazy object', function () {
        let injector;
        beforeEach(function () {
            injector = ioc.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            }
            injector.register('rectangle', Rectangle).singleton().lazy();
            injector.initialize();
        });
        it('should not exist instances', function () {
            should.not.exist(injector.getInstances()['rectangle']);
        });
        it('should created lazy', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
        });
        it('should created lazy once', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle);
            rectangle.area().should.equal(25);
            let r = rectangle.number;
            let r2 = injector.getObject('rectangle').number;
            r.should.be.eq(r2);
        });
    });
});
//# sourceMappingURL=lazy.js.map