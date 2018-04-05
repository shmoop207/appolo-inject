"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
let should = chai.should();
describe('Parent', function () {
    describe('get object from parent', function () {
        let injector, Rectangle;
        it('get object from parent', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                injector2.parent = injector;
                yield injector.initialize();
                yield injector2.initialize();
                let test2 = injector2.getObject('test2');
                test2.name.should.be.eq("aabbb");
            });
        });
    });
    describe('get object from child', function () {
        let injector, Rectangle;
        it('get object from child', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                yield injector.initialize();
                yield injector2.initialize();
                let test2 = injector2.getObject('test2');
                test2.name.should.be.eq("aabbb");
            });
        });
    });
});
//# sourceMappingURL=parent.js.map