"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const ioc = require("../lib/inject");
const decorators_1 = require("../lib/decorators");
const sleep = require("sleep-promise");
let should = chai.should();
describe('Property Factory', function () {
    describe('inject factory Object', function () {
        let injector;
        it('should inject object after factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                injector = ioc.createContainer();
                class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.manager.name;
                    }
                }
                class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.fooManager2;
                    }
                }
                injector.addDefinitions({
                    rectangle: {
                        type: Rectangle,
                        singleton: true,
                        properties: [
                            {
                                name: 'manager',
                                factory: 'fooManagerFactory'
                            }
                        ]
                    },
                    fooManager2: {
                        type: FooManager,
                        singleton: true
                    },
                    fooManagerFactory: {
                        type: FooManagerFactory,
                        factory: true,
                        singleton: true,
                        inject: ['fooManager2']
                    }
                });
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle.manager);
                rectangle.manager.should.be.instanceof(FooManager);
            });
        });
    });
    describe('inject factory Object linq', function () {
        let injector, FooManager;
        it('should inject object after factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.manager.name;
                    }
                }
                class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.fooManager2;
                    }
                }
                injector = ioc.createContainer();
                injector.register('rectangle', Rectangle).singleton().injectFactory('manager', 'fooManagerFactory');
                injector.register('fooManager2', FooManager).singleton();
                injector.register('fooManagerFactory', FooManagerFactory).factory().singleton().inject('fooManager2');
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle.manager);
                rectangle.manager.should.be.instanceof(FooManager);
            });
        });
    });
    describe('inject factory Object with decorators', function () {
        let injector;
        it('should inject object after factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let Rectangle = class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.fooManager.name;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.injectFactory()
                ], Rectangle.prototype, "fooManager", void 0);
                Rectangle = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], Rectangle);
                let FooManager = class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                };
                FooManager = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], FooManager);
                let FooManagerFactory = class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        this.fooManager.name = this.fooManager.name + "Factory";
                        return this.fooManager;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], FooManagerFactory.prototype, "fooManager", void 0);
                FooManagerFactory = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton(),
                    decorators_1.factory()
                ], FooManagerFactory);
                injector = ioc.createContainer();
                injector.register(Rectangle);
                injector.register(FooManager);
                injector.register(FooManagerFactory);
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle.fooManager);
                rectangle.fooManager.should.be.instanceof(FooManager);
                rectangle.fooManager.name.should.be.eq("fooFactory");
            });
        });
        it('should inject object after factory with inject and same name as factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let Rectangle = class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.fooManager.name;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], Rectangle.prototype, "fooManager", void 0);
                Rectangle = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], Rectangle);
                let FooManager = class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                };
                FooManager = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], FooManager);
                let FooManagerFactory = class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        this.fooManager.name = this.fooManager.name + "Factory";
                        return this.fooManager;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], FooManagerFactory.prototype, "fooManager", void 0);
                FooManagerFactory = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton(),
                    decorators_1.factory()
                ], FooManagerFactory);
                injector = ioc.createContainer();
                injector.register(Rectangle);
                injector.register(FooManager);
                injector.register(FooManagerFactory);
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle.fooManager);
                rectangle.fooManager.should.be.instanceof(FooManager);
                rectangle.fooManager.name.should.be.eq("fooFactory");
            });
        });
        it('should inject object after factory with inject  factory different name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let Rectangle = class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.barSomeName.name;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], Rectangle.prototype, "barSomeName", void 0);
                Rectangle = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], Rectangle);
                let FooManager = class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                };
                FooManager = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], FooManager);
                let BarSomeName = class BarSomeName {
                    constructor() {
                    }
                    get() {
                        this.fooManager.name = this.fooManager.name + "Factory";
                        return this.fooManager;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], BarSomeName.prototype, "fooManager", void 0);
                BarSomeName = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton(),
                    decorators_1.factory()
                ], BarSomeName);
                injector = ioc.createContainer();
                injector.register(Rectangle);
                injector.register(FooManager);
                injector.register(BarSomeName);
                yield injector.initialize();
                let rectangle = injector.getObject(Rectangle);
                should.exist(rectangle.barSomeName);
                rectangle.barSomeName.should.be.instanceof(FooManager);
                rectangle.barSomeName.name.should.be.eq("fooFactory");
            });
        });
        it('should inject multi factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let Rectangle = class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.factory1;
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], Rectangle.prototype, "factory1", void 0);
                Rectangle = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton()
                ], Rectangle);
                let Factory1 = class Factory1 {
                    constructor() {
                    }
                    get() {
                        return this.factory2 + "factory1";
                    }
                };
                tslib_1.__decorate([
                    decorators_1.inject()
                ], Factory1.prototype, "factory2", void 0);
                Factory1 = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton(),
                    decorators_1.factory()
                ], Factory1);
                let Factory2 = class Factory2 {
                    constructor() {
                    }
                    get() {
                        return "factory2";
                    }
                };
                Factory2 = tslib_1.__decorate([
                    decorators_1.define(),
                    decorators_1.singleton(),
                    decorators_1.factory()
                ], Factory2);
                injector = ioc.createContainer();
                injector.register(Rectangle);
                injector.register(Factory1);
                injector.register(Factory2);
                yield injector.initialize();
                let rectangle = injector.getObject(Rectangle);
                //should.exist(rectangle.barSomeName);
                rectangle.getName().should.be.eq("factory2factory1");
            });
        });
        // it.only('should inject multi factory async2', async ()=> {
        //     for(let i of  [100,10000,10]){
        //         await new Promise(resolve => {
        //             setTimeout(()=> resolve(),i)
        //         })
        //
        //         console.log(i)
        //     }
        // })
        it('should inject multi factory async', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1;
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "factory1", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return this.factory2 + "factory1";
                    });
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return "factory2";
                    });
                }
            };
            Factory2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            injector.register(Factory2);
            yield injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory2factory1");
        }));
        it('should inject multi factory async different containers', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1;
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "factory1", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return this.factory2 + "factory1";
                    });
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return "factory2";
                    });
                }
            };
            Factory2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", { injector: injector2 });
            yield injector2.initialize();
            yield injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory2factory1");
        }));
        it('should inject multi factory async parent container ', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1 + this.factory2;
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "factory1", void 0);
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "factory2", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            let Factory1 = class Factory1 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return "factory1";
                    });
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Factory1.prototype, "factory2", void 0);
            Factory1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory1);
            let Factory2 = class Factory2 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return this.factory1 + "factory2";
                    });
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Factory2.prototype, "factory1", void 0);
            Factory2 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory2);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            injector.register(Factory1);
            let injector2 = ioc.createContainer();
            injector2.parent = injector;
            injector2.register(Factory2);
            injector.addDefinition("factory2", { injector: injector2 });
            yield injector2.initialize();
            yield injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory1factory1factory2");
        }));
        it('should inject multi factory async multi child containers ', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let Rectangle = class Rectangle {
                constructor() {
                }
                getName() {
                    return this.factory1 + this.fooManager.getName();
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "factory1", void 0);
            tslib_1.__decorate([
                decorators_1.inject()
            ], Rectangle.prototype, "fooManager", void 0);
            Rectangle = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], Rectangle);
            let FooManager = class FooManager {
                constructor() {
                }
                getName() {
                    return this.factory1 + "FooManager";
                }
            };
            tslib_1.__decorate([
                decorators_1.inject()
            ], FooManager.prototype, "factory1", void 0);
            FooManager = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton()
            ], FooManager);
            let Factory1 = class Factory1 {
                constructor() {
                }
                get() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield sleep(10);
                        return "factory1";
                    });
                }
            };
            Factory1 = tslib_1.__decorate([
                decorators_1.define(),
                decorators_1.singleton(),
                decorators_1.factory()
            ], Factory1);
            injector = ioc.createContainer();
            injector.register(Rectangle);
            let injector2 = ioc.createContainer();
            injector2.register(FooManager);
            injector.addDefinition("fooManager", { injector: injector2 });
            let injector3 = ioc.createContainer();
            injector.addDefinition("factory1", { injector: injector3 });
            injector2.addDefinition("factory1", { injector: injector3 });
            injector3.register(Factory1);
            yield injector3.initialize();
            yield injector2.initialize();
            yield injector.initialize();
            let rectangle = injector.getObject(Rectangle);
            rectangle.getName().should.be.eq("factory1factory1FooManager");
        }));
    });
    describe('inject factory Object to not singleton ', function () {
        it('should inject object after factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let injector = ioc.createContainer();
                class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.manager.name;
                    }
                }
                class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.fooManager2;
                    }
                }
                injector.addDefinitions({
                    rectangle: {
                        type: Rectangle,
                        singleton: false,
                        properties: [
                            {
                                name: 'manager',
                                factory: 'fooManagerFactory'
                            }
                        ]
                    },
                    fooManager2: {
                        type: FooManager,
                        singleton: true
                    },
                    fooManagerFactory: {
                        factory: true,
                        type: FooManagerFactory,
                        singleton: true,
                        inject: ['fooManager2']
                    }
                });
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle.manager);
                rectangle.manager.should.be.instanceof(FooManager);
            });
        });
    });
    describe('inject factory Object', function () {
        it('should inject object with get object', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let injector = ioc.createContainer();
                class LocalFooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.localFooManager;
                    }
                }
                injector.addDefinitions({
                    localFooManager: {
                        type: LocalFooManager,
                        singleton: true
                    },
                    fooManagerFactory: {
                        type: FooManagerFactory,
                        singleton: true,
                        inject: ['localFooManager']
                    }
                });
                yield injector.initialize();
                let fooManager = yield injector.getFactory('fooManager');
                should.exist(fooManager);
                fooManager.should.be.instanceof(LocalFooManager);
                fooManager.name.should.be.equal("foo");
            });
        });
    });
    describe('inject 2 factories', function () {
        it('should inject object with get object', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let injector = ioc.createContainer();
                class LocalFooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class RemoteBarManager {
                    constructor() {
                        this.name = 'bar';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.localFooManager;
                    }
                }
                class BarManagerFactory {
                    constructor() {
                    }
                    get() {
                        return this.remoteBarManager;
                    }
                }
                class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.fooManager.name;
                    }
                    getName2() {
                        return this.barManager.name;
                    }
                }
                injector.addDefinitions({
                    localFooManager: {
                        type: LocalFooManager,
                        singleton: true
                    },
                    remoteBarManager: {
                        type: RemoteBarManager,
                        singleton: true
                    },
                    fooManagerFactory: {
                        type: FooManagerFactory,
                        singleton: true,
                        factory: true,
                        inject: ['localFooManager']
                    },
                    barManagerFactory: {
                        type: BarManagerFactory,
                        singleton: true,
                        factory: true,
                        inject: ['remoteBarManager']
                    },
                    rectangle: {
                        type: Rectangle,
                        singleton: true,
                        inject: [{ name: 'barManager', factory: "barManagerFactory" }, {
                                name: 'fooManager',
                                factory: "fooManagerFactory"
                            }]
                    }
                });
                yield injector.initialize();
                let rectangle = injector.getObject('rectangle');
                should.exist(rectangle);
                should.exist(rectangle.fooManager);
                should.exist(rectangle.barManager);
                rectangle.fooManager.should.be.instanceof(LocalFooManager);
                rectangle.barManager.should.be.instanceof(RemoteBarManager);
                rectangle.getName().should.be.equal("foo");
                rectangle.getName2().should.be.equal("bar");
            });
        });
    });
    describe('inject factory with same object name', function () {
        it('should inject object after factory', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let injector = ioc.createContainer();
                class Rectangle {
                    constructor() {
                    }
                    getName() {
                        return this.fooManager.name;
                    }
                }
                class FooManager {
                    constructor() {
                        this.name = 'foo';
                    }
                }
                class FooManagerFactory {
                    constructor() {
                    }
                    get() {
                        this.fooManager.name += "Factory";
                        return this.fooManager;
                    }
                }
                injector.addDefinitions({
                    rectangle: {
                        type: Rectangle,
                        singleton: true,
                        inject: [{
                                name: 'fooManager',
                                factory: "fooManagerFactory"
                            }]
                    },
                    fooManager: {
                        type: FooManager,
                        singleton: true
                    },
                    fooManagerFactory: {
                        type: FooManagerFactory,
                        singleton: true,
                        factory: true,
                        inject: ['fooManager']
                    }
                });
                yield injector.initialize();
                //var rectangle = injector.getObject('rectangle');
                var fooManagerFactory = injector.getObject('fooManagerFactory');
                var rectangle = injector.getObject(Rectangle);
                should.exist(fooManagerFactory.fooManager);
                should.exist(rectangle.fooManager);
                rectangle.fooManager.should.be.instanceof(FooManager);
                rectangle.fooManager.name.should.be.eq("fooFactory");
            });
        });
    });
});
//# sourceMappingURL=factory.js.map