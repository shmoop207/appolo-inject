"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = require('./lib/inject');
var inject_1 = require("./lib/inject");
exports.Injector = inject_1.Injector;
exports.createContainer = inject_1.createContainer;
var define_1 = require("./lib/define");
exports.Define = define_1.Define;
var util_1 = require("./lib/util");
exports.Util = util_1.Util;
var decorators_1 = require("./lib/decorators");
exports.InjectDefineSymbol = decorators_1.InjectDefineSymbol;
exports.define = decorators_1.define;
exports.injectParam = decorators_1.injectParam;
exports.singleton = decorators_1.singleton;
exports.inject = decorators_1.inject;
exports.injectAliasFactory = decorators_1.injectAliasFactory;
exports.injectAlias = decorators_1.injectAlias;
exports.injectFactoryMethod = decorators_1.injectFactoryMethod;
exports.initMethod = decorators_1.initMethod;
exports.injectArray = decorators_1.injectArray;
exports.injectDictionary = decorators_1.injectDictionary;
exports.injectFactory = decorators_1.injectFactory;
exports.injectObjectProperty = decorators_1.injectObjectProperty;
exports.injectValue = decorators_1.injectValue;
exports.aliasFactory = decorators_1.aliasFactory;
exports.alias = decorators_1.alias;
exports.lazy = decorators_1.lazy;
exports.factory = decorators_1.factory;
exports.override = decorators_1.override;
//# sourceMappingURL=index.js.map