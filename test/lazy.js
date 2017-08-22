"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let should = require('chai').should(), inject = require('../lib/inject');
describe('Lazy', function () {
    describe.only('create lazy object', function () {
        let injector;
        beforeEach(function () {
            injector = inject.createContainer();
            class Rectangle {
                constructor() {
                    this.number = Math.random();
                }
                area() {
                    return 25;
                }
            }
            injector.define('rectangle', Rectangle).singleton().lazy();
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