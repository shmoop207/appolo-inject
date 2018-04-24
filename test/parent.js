"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const decorators_1 = require("../lib/decorators");
const chai = require("chai");
const ioc = require("../lib/inject");
let should = chai.should();
describe('Parent', function () {
    describe('get object from parent', function () {
        let injector, Rectangle;
        it('get object from parent', async function () {
            injector = ioc.createContainer();
            let Test1 = class Test1 {
                constructor() {
                    this.name = "aa";
                }
                initialize() {
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test1.prototype, "initialize", null);
            Test1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test1);
            let Test2 = class Test2 {
                constructor() {
                }
                initialize() {
                    this.name = this.test1.name + "bbb";
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test2.prototype, "test1", void 0);
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test2.prototype, "initialize", null);
            Test2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test2);
            injector = ioc.createContainer();
            injector.register(Test1);
            let injector2 = ioc.createContainer();
            injector2.register(Test2);
            injector2.parent = injector;
            await injector.initialize();
            //await injector2.initialize();
            let test2 = injector2.getObject('test2');
            test2.name.should.be.eq("aabbb");
        });
    });
    describe('get object from child', function () {
        let injector, Rectangle;
        it('get object from child', async function () {
            injector = ioc.createContainer();
            let Test1 = class Test1 {
                constructor() {
                }
                initialize() {
                    this.name = "aa";
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test1.prototype, "initialize", null);
            Test1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test1);
            let Test2 = class Test2 {
                constructor() {
                }
                initialize() {
                    this.name = this.test1.name + "bbb";
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test2.prototype, "test1", void 0);
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test2.prototype, "initialize", null);
            Test2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test2);
            injector = ioc.createContainer();
            injector.register(Test1);
            let injector2 = ioc.createContainer();
            injector2.register(Test2);
            injector2.addDefinition("test1", { injector: injector });
            await injector.initialize();
            await injector2.initialize();
            let test2 = injector2.getObject('test2');
            test2.name.should.be.eq("aabbb");
        });
    });
    describe('get object from alias from parent', function () {
        let injector, Rectangle;
        it('get object from child', async function () {
            injector = ioc.createContainer();
            let Test1 = class Test1 {
                constructor() {
                }
                initialize() {
                    this.name = "aa";
                }
            };
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test1.prototype, "initialize", null);
            Test1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.alias("ITest")
            ], Test1);
            let Test2 = class Test2 {
                constructor() {
                }
                initialize() {
                    this.len = this.test1.length;
                }
            };
            tslib_1.__decorate([
                decorators_1.injectAlias("ITest")
            ], Test2.prototype, "test1", void 0);
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test2.prototype, "initialize", null);
            Test2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test2);
            injector = ioc.createContainer();
            injector.register(Test1);
            let injector2 = ioc.createContainer();
            injector2.register(Test2);
            injector2.parent = injector;
            await injector.initialize();
            let test2 = injector2.getObject('test2');
            test2.len.should.be.eq(1);
        });
    });
});
//# sourceMappingURL=parent.js.map