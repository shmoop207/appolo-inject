"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const inject = require("../lib/inject");
let should = chai.should();
describe('Property Factory', function () {
    describe('inject factory Object', function () {
        let injector;
        it('should inject object after factory', function () {
            injector = inject.createContainer();
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
                    singleton: true,
                    inject: ['fooManager2']
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object linq', function () {
        let injector, FooManager;
        it('should inject object after factory', function () {
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
            injector = inject.createContainer();
            injector.define('rectangle', Rectangle).singleton().injectFactory('manager', 'fooManagerFactory')
                .define('fooManager2', FooManager).singleton()
                .define('fooManagerFactory', FooManagerFactory).singleton().inject('fooManager2');
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object to not singleton ', function () {
        it('should inject object after factory', function () {
            let injector = inject.createContainer();
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
                    type: FooManagerFactory,
                    singleton: true,
                    inject: ['fooManager2']
                }
            });
            injector.initialize();
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.manager);
            rectangle.manager.should.be.instanceof(FooManager);
        });
    });
    describe('inject factory Object', function () {
        it('should inject object with get object', function () {
            let injector = inject.createContainer();
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
            injector.initialize();
            let fooManager = injector.getObject('fooManager');
            should.exist(fooManager);
            fooManager.should.be.instanceof(LocalFooManager);
            fooManager.name.should.be.equal("foo");
        });
    });
    describe('inject 2 factories', function () {
        it('should inject object with get object', function () {
            let injector = inject.createContainer();
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
                    inject: ['localFooManager']
                },
                barManagerFactory: {
                    type: BarManagerFactory,
                    singleton: true,
                    inject: ['remoteBarManager']
                },
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: ['barManager', 'fooManager']
                }
            });
            injector.initialize();
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
    describe('inject factory with same object name', function () {
        it('should inject object after factory', function () {
            let injector = inject.createContainer();
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
                    return this.fooManager;
                }
            }
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    inject: ['fooManager']
                },
                fooManager: {
                    type: FooManager,
                    singleton: true
                },
                fooManagerFactory: {
                    type: FooManagerFactory,
                    singleton: true,
                    inject: ['fooManager']
                }
            });
            injector.initialize();
            //var rectangle = injector.getObject('rectangle');
            var fooManagerFactory = injector.getObject('fooManagerFactory');
            should.exist(fooManagerFactory.fooManager);
            //should.exist(rectangle.fooManager);
            //rectangle.fooManager.should.be.instanceof(FooManager);
        });
    });
});
//# sourceMappingURL=factory.js.map