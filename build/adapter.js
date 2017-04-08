'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.adapterFactory = exports.QUnitAdapter = undefined;

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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _qunitjs = require('qunitjs');

var _qunitjs2 = _interopRequireDefault(_qunitjs);

var _reporter = require('./reporter');

var _reporter2 = _interopRequireDefault(_reporter);

var _hooker = require('./hooker');

var _hooker2 = _interopRequireDefault(_hooker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * QUnit runner
 */
var QUnitAdapter = function () {
    function QUnitAdapter(cid, config, specs, capabilities) {
        (0, _classCallCheck3.default)(this, QUnitAdapter);

        this.cid = cid;
        this.capabilities = capabilities;
        this.specs = specs;
        this.config = (0, _assign2.default)({
            qunitOpts: {}
        }, config);

        this.runner = global.QUnit = _get__('QUnit');

        this.hooker = new (_get__('QUnitHooker'))(this);
        this.reporter = new (_get__('QUnitReporter'))(this);
    }

    (0, _createClass3.default)(QUnitAdapter, [{
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var _this = this;

                var result;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // setup QUnit
                                (0, _keys2.default)(this.config.qunitOpts).forEach(function (key) {
                                    _this.runner.config[key] = _this.config.qunitOpts[key];
                                });
                                this.runner.config.autostart = false;

                                // setup hooks & reporter
                                this.hooker.setupHooks();
                                this.reporter.setupEventListeners();

                                _context.next = 6;
                                return this.hooker.execStartHook();

                            case 6:
                                _context.next = 8;
                                return new _promise2.default(function (resolve, reject) {
                                    // load QUnit tests
                                    _this.requireExternalModules(_this.specs);
                                    // start & end QUnit
                                    _this.runner.done(function (details) {
                                        return resolve(details.failed);
                                    });
                                    _this.runner.start();
                                });

                            case 8:
                                result = _context.sent;
                                _context.next = 11;
                                return this.hooker.execEndHook(result);

                            case 11:
                                _context.next = 13;
                                return this.reporter.waitUntilSettled();

                            case 13:
                                return _context.abrupt('return', result);

                            case 14:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function run() {
                return _ref.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'requireExternalModules',
        value: function requireExternalModules(modules, context) {
            var _this2 = this;

            modules.forEach(function (module) {
                if (module) {
                    module = module.replace(/.*:/, '');

                    if (module.substr(0, 1) === '.') {
                        module = _get__('path').join(process.cwd(), module);
                    }

                    _this2.load(module, context);
                }
            });
        }
    }, {
        key: 'load',
        value: function load(name, context) {
            try {
                module.context = context || module.context;

                require(name);
            } catch (e) {
                throw new Error('Module ' + name + ' can\'t get loaded. Are you sure you have installed it?\n' + 'Note: if you\'ve installed WebdriverIO globally you need to install ' + 'these external modules globally too!');
            }
        }
    }]);
    return QUnitAdapter;
}();

var _QUnitAdapter = _get__('QUnitAdapter');
var adapterFactory = {};

_get__('adapterFactory').run = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cid, config, specs, capabilities) {
        var adapter;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        adapter = new (_get__('_QUnitAdapter'))(cid, config, specs, capabilities);
                        _context2.next = 3;
                        return adapter.run();

                    case 3:
                        return _context2.abrupt('return', _context2.sent);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x, _x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

exports.default = _get__('adapterFactory');
exports.QUnitAdapter = QUnitAdapter;
exports.adapterFactory = adapterFactory;

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
        case 'QUnit':
            return _qunitjs2.default;

        case 'QUnitHooker':
            return _hooker2.default;

        case 'QUnitReporter':
            return _reporter2.default;

        case 'path':
            return _path2.default;

        case 'QUnitAdapter':
            return QUnitAdapter;

        case 'adapterFactory':
            return adapterFactory;

        case '_QUnitAdapter':
            return _QUnitAdapter;
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

var _typeOfOriginalExport = typeof adapterFactory === 'undefined' ? 'undefined' : (0, _typeof3.default)(adapterFactory);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty2.default)(adapterFactory, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(adapterFactory)) {
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