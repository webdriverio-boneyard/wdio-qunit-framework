'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _isExtensible = require('babel-runtime/core-js/object/is-extensible');

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _wdioSync = require('wdio-sync');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEST_COMMANDS = ['module', 'test', 'todo', 'skip', 'only'];

var QUNIT_HOOKS = {
    'moduleStart': 'beforeSuite',
    'testStart': 'beforeTest',
    'testDone': 'afterTest',
    'moduleDone': 'afterSuite'
};

var COMMANDS = [].concat((0, _toConsumableArray3.default)(_get__('TEST_COMMANDS')), (0, _toConsumableArray3.default)((0, _keys2.default)(_get__('QUNIT_HOOKS'))));

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
            _get__('wrapCommands')(global.browser, this.adapter.config.beforeCommand, this.adapter.config.afterCommand);

            // wrap QUnit commands into fiber context
            _get__('COMMANDS').forEach(function (fnName) {
                _get__('runInFiberContext')(_get__('TEST_COMMANDS'), _this.adapter.config.beforeHook, _this.adapter.config.afterHook, fnName, _this.adapter.runner);
            });

            // let QUnit hooks trigger WDIO hooks
            (0, _keys2.default)(_get__('QUNIT_HOOKS')).forEach(function (hookName) {
                _this.adapter.runner[hookName](_this.wrapHook(_get__('QUNIT_HOOKS')[hookName]));
            });
        }
    }, {
        key: 'execStartHook',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _get__('executeHooksWithArgs')(this.adapter.config.before, [this.adapter.capabilities, this.adapter.specs]);

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
                                _get__('executeHooksWithArgs')(this.adapter.config.after, [result, this.adapter.capabilities, this.adapter.specs]);

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
    }, {
        key: 'wrapHook',
        value: function wrapHook(hookName) {
            var _this2 = this;

            return function (assert) {
                return _get__('executeHooksWithArgs')(_this2.adapter.config[hookName], assert).catch(function (e) {
                    console.log('Error in ' + hookName + ' hook', e.stack);
                });
            };
        }
    }]);
    return QUnitHooker;
}();

exports.default = _get__('QUnitHooker');

var _RewiredData__ = (0, _create2.default)(null);

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
var _RewireAPI__ = {};

(function () {
    function addPropertyToAPIObject(name, value) {
        (0, _defineProperty2.default)(_RewireAPI__, name, {
            value: value,
            enumerable: false,
            configurable: true
        });
    }

    addPropertyToAPIObject('__get__', _get__);
    addPropertyToAPIObject('__GetDependency__', _get__);
    addPropertyToAPIObject('__Rewire__', _set__);
    addPropertyToAPIObject('__set__', _set__);
    addPropertyToAPIObject('__reset__', _reset__);
    addPropertyToAPIObject('__ResetDependency__', _reset__);
    addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
    if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
        return _get_original__(variableName);
    } else {
        var value = _RewiredData__[variableName];

        if (value === INTENTIONAL_UNDEFINED) {
            return undefined;
        } else {
            return value;
        }
    }
}

function _get_original__(variableName) {
    switch (variableName) {
        case 'TEST_COMMANDS':
            return TEST_COMMANDS;

        case 'QUNIT_HOOKS':
            return QUNIT_HOOKS;

        case 'wrapCommands':
            return _wdioSync.wrapCommands;

        case 'COMMANDS':
            return COMMANDS;

        case 'runInFiberContext':
            return _wdioSync.runInFiberContext;

        case 'executeHooksWithArgs':
            return _wdioSync.executeHooksWithArgs;

        case 'QUnitHooker':
            return QUnitHooker;
    }

    return undefined;
}

function _assign__(variableName, value) {
    if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
        return _set_original__(variableName, value);
    } else {
        return _RewiredData__[variableName] = value;
    }
}

function _set_original__(variableName, _value) {
    switch (variableName) {}

    return undefined;
}

function _update_operation__(operation, variableName, prefix) {
    var oldValue = _get__(variableName);

    var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

    _assign__(variableName, newValue);

    return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
    if ((typeof variableName === 'undefined' ? 'undefined' : (0, _typeof3.default)(variableName)) === 'object') {
        (0, _keys2.default)(variableName).forEach(function (name) {
            _RewiredData__[name] = variableName[name];
        });
    } else {
        if (value === undefined) {
            _RewiredData__[variableName] = INTENTIONAL_UNDEFINED;
        } else {
            _RewiredData__[variableName] = value;
        }

        return function () {
            _reset__(variableName);
        };
    }
}

function _reset__(variableName) {
    delete _RewiredData__[variableName];
}

function _with__(object) {
    var rewiredVariableNames = (0, _keys2.default)(object);
    var previousValues = {};

    function reset() {
        rewiredVariableNames.forEach(function (variableName) {
            _RewiredData__[variableName] = previousValues[variableName];
        });
    }

    return function (callback) {
        rewiredVariableNames.forEach(function (variableName) {
            previousValues[variableName] = _RewiredData__[variableName];
            _RewiredData__[variableName] = object[variableName];
        });
        var result = callback();

        if (!!result && typeof result.then == 'function') {
            result.then(reset).catch(reset);
        } else {
            reset();
        }

        return result;
    };
}

var _typeOfOriginalExport = typeof QUnitHooker === 'undefined' ? 'undefined' : (0, _typeof3.default)(QUnitHooker);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty2.default)(QUnitHooker, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(QUnitHooker)) {
    addNonEnumerableProperty('__get__', _get__);
    addNonEnumerableProperty('__GetDependency__', _get__);
    addNonEnumerableProperty('__Rewire__', _set__);
    addNonEnumerableProperty('__set__', _set__);
    addNonEnumerableProperty('__reset__', _reset__);
    addNonEnumerableProperty('__ResetDependency__', _reset__);
    addNonEnumerableProperty('__with__', _with__);
    addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;