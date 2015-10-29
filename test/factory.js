"use strict";
var should = require('chai').should(),
    inject = require('../lib/inject');

describe('Property Factory', function () {

    describe('inject factory Object', function () {
        var injector, FooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class{

                constructor () {

                }
                getName () {

                    return this.manager.name;
                }

            }

            FooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            var FooManagerFactory = class{

                constructor () {

                }
                get () {
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
        });

        it('should inject object after factory', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });

    describe('inject factory Object to not singleton ', function () {
        var injector, FooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class{

                constructor () {

                }
                getName () {

                    return this.manager.name;
                }

            }

            FooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            var FooManagerFactory = class{

                constructor () {

                }
                get () {
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
        });

        it('should inject object after factory', function () {

            var rectangle = injector.getObject('rectangle');

            should.exist(rectangle.manager);

            rectangle.manager.should.be.instanceof(FooManager);
        });
    });


    describe('inject factory Object', function () {
        var injector, LocalFooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            LocalFooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            var FooManagerFactory = class{

                constructor () {

                }

                get () {
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
        });

        it('should inject object with get object', function () {

            var fooManager = injector.getObject('fooManager');

            should.exist(fooManager);

            fooManager.should.be.instanceof(LocalFooManager);

            fooManager.name.should.be.equal("foo");
        });
    });

    describe('inject 2 factories', function () {
        var injector, LocalFooManager, RemoteBarManager;

        beforeEach(function () {
            injector = inject.createContainer();

            LocalFooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            RemoteBarManager = class{

                constructor () {
                    this.name = 'bar';
                }
            }

            var FooManagerFactory = class{

                constructor () {

                }

                get () {
                    return this.localFooManager;
                }
            }

            var BarManagerFactory = class{

                constructor () {

                }

                get () {
                    return this.remoteBarManager;
                }
            }

            var Rectangle = class{

                constructor () {

                }
                getName () {

                    return this.fooManager.name;
                }
                getName2 () {

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
        });

        it('should inject object with get object', function () {

            var rectangle = injector.getObject('rectangle');

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
        var injector, FooManager;

        beforeEach(function () {
            injector = inject.createContainer();

            var Rectangle = class{

                constructor () {

                }
                getName () {

                    return this.fooManager.name;
                }

            }

            FooManager = class{

                constructor () {
                    this.name = 'foo';
                }
            }

            var FooManagerFactory = class{

                constructor () {

                }
                get () {
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
        });

        it('should inject object after factory', function () {

            //var rectangle = injector.getObject('rectangle');
            var fooManagerFactory = injector.getObject('fooManagerFactory');

            should.exist(fooManagerFactory.fooManager);

            //should.exist(rectangle.fooManager);

            //rectangle.fooManager.should.be.instanceof(FooManager);
        });
    });


});

