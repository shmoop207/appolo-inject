"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const decorators_1 = require("../lib/decorators");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const ioc = require("../lib/inject");
chai.use(sinonChai);
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
    describe('inherit from child', function () {
        let injector, Rectangle;
        it('should inherit  object from child', async function () {
            injector = ioc.createContainer();
            let Alias = class Alias {
            };
            Alias = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.alias("Alias")
            ], Alias);
            let Alias2 = class Alias2 {
            };
            Alias2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.aliasFactory("Alias2")
            ], Alias2);
            let Factory = class Factory {
                async get() {
                    return "working";
                }
            };
            Factory = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory);
            let Test1 = class Test1 {
                constructor() {
                }
                initialize() {
                    this.name = "aa" + this.env.name;
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test1.prototype, "env", void 0);
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test1.prototype, "logger", void 0);
            tslib_1.__decorate([
                decorators_1.inject()
            ], Test1.prototype, "factory", void 0);
            tslib_1.__decorate([
                decorators_1.injectAlias("Alias")
            ], Test1.prototype, "test", void 0);
            tslib_1.__decorate([
                decorators_1.injectAliasFactory("Alias2")
            ], Test1.prototype, "createAlias2", void 0);
            tslib_1.__decorate([
                decorators_1.injectFactoryMethod(Alias)
            ], Test1.prototype, "createAlias", void 0);
            tslib_1.__decorate([
                decorators_1.initMethod()
            ], Test1.prototype, "initialize", null);
            Test1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test1);
            let Test2 = class Test2 extends Test1 {
            };
            Test2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Test2);
            injector = ioc.createContainer();
            injector.register(Test1);
            injector.register(Alias);
            injector.register(Alias2);
            injector.register(Factory);
            injector.addObject("env", { name: "bbb" });
            let injector2 = ioc.createContainer();
            injector2.addObject("env", { name: "ccc" });
            injector2.addObject("logger", { info: "bla" });
            injector2.register(Test2);
            injector.parent = injector2;
            await injector2.initialize();
            let test1 = injector.getObject('test1');
            let test2 = injector2.getObject('test2');
            test2.name.should.be.eq("aabbb");
            test2.test[0].constructor.name.should.be.eq("Alias");
            test2.createAlias().constructor.name.should.be.eq("Alias");
            test2.createAlias2[0]().constructor.name.should.be.eq("Alias2");
            test2.factory.should.be.eq("working");
            test2.logger.info.should.be.eq("bla");
        });
        describe('inherit from child', function () {
            it('should inject nested parent', async function () {
                let injector = ioc.createContainer();
                let injector2 = ioc.createContainer();
                let injector3 = ioc.createContainer();
                let ClassA = class ClassA {
                    constructor() {
                        this.name = "working";
                    }
                };
                ClassA = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], ClassA);
                injector.register(ClassA);
                injector.parent = injector2;
                injector2.addDefinition("classA", {
                    injector: injector,
                    refName: "classA"
                });
                injector2.parent = injector3;
                injector3.addDefinition("classA", {
                    injector: injector2,
                    refName: "classA"
                });
                await injector3.initialize();
                let test1 = injector3.getObject(ClassA);
                test1.name.should.be.ok;
            });
        });
        describe('fire parent events', function () {
            it('should fire created events', async function () {
                let injector = ioc.createContainer();
                let injector2 = ioc.createContainer();
                let ClassA = class ClassA {
                    constructor() {
                        this.name = "working";
                    }
                };
                ClassA = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], ClassA);
                let ClassB = class ClassB {
                    constructor() {
                        this.name = "working";
                    }
                };
                ClassB = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], ClassB);
                injector.register(ClassA);
                injector.parent = injector2;
                injector2.register(ClassB);
                let spy1 = sinon.spy();
                let spy2 = sinon.spy();
                let spy3 = sinon.spy();
                let spy4 = sinon.spy();
                injector2.instanceCreatedEvent.on(spy1);
                injector2.instanceOwnCreatedEvent.on(spy2);
                injector2.instanceInitializedEvent.on(spy3);
                injector2.instanceOwnInitializedEvent.on(spy4);
                await injector2.initialize();
                spy1.should.have.been.callCount(2);
                spy2.should.have.been.callCount(1);
                spy1.getCall(0).args[0].definition.type === ClassA;
                spy1.getCall(0).args[0].instance.constructor === ClassA;
            });
        });
    });
});
//# sourceMappingURL=parent.js.map