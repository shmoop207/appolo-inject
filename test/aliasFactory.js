"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const ioc = require("../lib/inject");
let should = chai.should();
describe('Alias Factory', function () {
    describe('should inject alias factory', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                constructor(num) {
                    this.num = num || 25;
                }
                calc() {
                    return this.num;
                }
            };
            injector.addDefinitions({
                rectangle: {
                    type: Rectangle,
                    singleton: true,
                    props: [
                        {
                            name: 'calcable',
                            aliasFactory: 'calcable'
                        }
                    ]
                },
                calcManager: {
                    type: CalcManager,
                    aliasFactory: ['calcable'],
                    singleton: false
                }
            });
            await injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0]();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
        it('should inject property with run time params', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0](30);
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(30);
        });
    });
    describe('should inject alias factory link', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                constructor(num) {
                    this.num = num || 25;
                }
                calc() {
                    return this.num;
                }
            };
            injector.register('rectangle', Rectangle)
                .singleton()
                .injectAliasFactory('calcable', 'calcable');
            injector.register('calcManager', CalcManager).aliasFactory(['calcable']);
            await injector.initialize();
        });
        it('should inject property ', function () {
            var rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0]();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
        it('should inject property with run time params', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Array);
            rectangle.calcable.length.should.be.equal(1);
            let calcable = rectangle.calcable[0](30);
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(30);
        });
    });
    describe('should inject alias factory link indexBy', function () {
        let injector, CalcManager;
        beforeEach(async function () {
            injector = ioc.createContainer();
            let Rectangle = class {
                constructor() {
                }
            };
            CalcManager = class {
                static get NAME() {
                    return "test";
                }
                constructor(num) {
                    this.num = num || 25;
                }
                calc() {
                    return this.num;
                }
            };
            injector.register('rectangle', Rectangle).singleton().injectAliasFactory('calcable', 'calcable', "NAME");
            injector.register('calcManager', CalcManager).aliasFactory(['calcable']);
            await injector.initialize();
        });
        it('should inject property ', function () {
            let rectangle = injector.getObject('rectangle');
            should.exist(rectangle.calcable);
            rectangle.calcable.should.be.an.instanceOf(Object);
            let calcable = rectangle.calcable.test();
            calcable.calc.should.be.a('function');
            calcable.calc().should.be.eq(25);
        });
    });
});
//# sourceMappingURL=aliasFactory.js.map