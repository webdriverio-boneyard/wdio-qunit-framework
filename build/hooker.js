'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _wdioSync = require('wdio-sync');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEST_COMMANDS = ['module', 'test', 'todo', 'skip', 'only'];

var COMMANDS = [].concat(TEST_COMMANDS);

var MODULE_HOOKS = {
    'before': 'beforeSuite',
    'beforeEach': 'beforeTest',
    'afterEach': 'afterTest',
    'after': 'afterSuite'
};

var NOOP = function NOOP() {};

/**
 * QUnit hooker
 */

var QUnitHooker = function () {
    function QUnitHooker(adapter) {
        (0, _classCallCheck3.default)(this, QUnitHooker);

        this.adapter = adapter;
    }

    (0, _createClass3.default)(QUnitHooker, [{
        key: 'setupHooks',
        value: function setupHooks() {
            var _this = this;

            // trigger before and after wdio config hooks
            (0, _wdioSync.wrapCommands)(global.browser, this.adapter.config.beforeCommand, this.adapter.config.afterCommand);

            // wrap QUnit commands into fiber context
            COMMANDS.forEach(function (fnName) {
                (0, _wdioSync.runInFiberContext)(TEST_COMMANDS, _this.adapter.config.beforeHook, _this.adapter.config.afterHook, fnName, _this.adapter.runner);
            });

            // wrap QUnit.module hooks
            var qunitModule = this.adapter.runner.module;
            this.adapter.runner.module = function (name, testEnvironment, executeNow) {
                if (typeof testEnvironment !== 'function') {
                    testEnvironment = testEnvironment || {};
                    (0, _keys2.default)(MODULE_HOOKS).forEach(function (hookName) {
                        var origHook = testEnvironment[hookName] || NOOP;
                        testEnvironment[hookName] = function (assert) {
                            return _this.wrapHook(MODULE_HOOKS[hookName])(assert).then(_promise2.default.resolve(origHook));
                        };
                    });
                } else {
                    var origTestEnvironment = testEnvironment;
                    testEnvironment = function testEnvironment(hooks) {
                        (0, _keys2.default)(MODULE_HOOKS).forEach(function (hookName) {
                            hooks[hookName](function (assert) {
                                return _this.wrapHook(MODULE_HOOKS[hookName])(assert);
                            });
                        });
                        origTestEnvironment(hooks);
                    };
                }

                // run original QUnit.module with wrapped hooks
                qunitModule(name, testEnvironment, executeNow);
            };
        }
    }, {
        key: 'execStartHook',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                (0, _wdioSync.executeHooksWithArgs)(this.adapter.config.before, [this.adapter.capabilities, this.adapter.specs]);

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function execStartHook() {
                return _ref.apply(this, arguments);
            }

            return execStartHook;
        }()
    }, {
        key: 'execEndHook',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(result) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                (0, _wdioSync.executeHooksWithArgs)(this.adapter.config.after, [result, this.adapter.capabilities, this.adapter.specs]);

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function execEndHook(_x) {
                return _ref2.apply(this, arguments);
            }

            return execEndHook;
        }()

        /**
         * Hooks which are added as true QUnit hooks need to call done() to notify async
         */

    }, {
        key: 'wrapHook',
        value: function wrapHook(hookName) {
            var _this2 = this;

            return function (assert) {
                return (0, _wdioSync.executeHooksWithArgs)(_this2.adapter.config[hookName], assert).catch(function (e) {
                    console.log('Error in ' + hookName + ' hook', e.stack);
                });
            };
        }
    }]);
    return QUnitHooker;
}();

exports.default = QUnitHooker;
module.exports = exports['default'];