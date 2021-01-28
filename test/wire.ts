"use strict";
import chai = require('chai');
import    ioc = require('../index');
import {Injector} from "../lib/inject/inject";
import {define} from "../lib/decorators/define";
import {singleton} from "../lib/decorators/singleton";
import {lazy} from "../lib/decorators/lazy";
import {inject} from "../lib/decorators/inject";
import {factory} from "../lib/decorators/factory";

let should = chai.should();

describe('Wire', function () {

    describe('should wire class', function () {
        let injector: Injector, CalcManager;

        beforeEach(async function () {
            injector = ioc.createContainer();


        });

        it('should wire class ', async function () {

            let injector1 = ioc.createContainer();
            let injector2 = ioc.createContainer();

            @define()
            @singleton()
            class B {
                name() {
                    return "B"
                }
            }

            @define()
            @singleton()
            @factory()
            class C {
                get() {
                    return "C"
                }
            }

            @define()
            class A {
                constructor(a: string) {
                }

                @lazy() b: B
                @inject() c: string
            }

            injector1.register(B);
            injector2.register(C);

            injector1.parent = injector2

            await injector1.initialize();
            await injector2.initialize();


            let rectangle = injector1.wire(A,["1"]);

            should.exist(rectangle.b);

            rectangle.b.name().should.be.eq("B");
            rectangle.c.should.be.eq("C");
        });

    })

});
