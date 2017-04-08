'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _isExtensible = require('babel-runtime/core-js/object/is-extensible');

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty4 = require('babel-runtime/helpers/defineProperty');

var _defineProperty5 = _interopRequireDefault(_defineProperty4);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REPORTER_EVENTS = {
    // 'runStart': 'start',
    'suiteStart': 'suite:start',
    'testStart': 'test:start',
    'testEnd': 'test:end',
    'suiteEnd': 'suite:end'
    // 'runEnd': 'end'
};

var SETTLE_TIMEOUT = 5000;

/**
 * QUnit reporter
 */

var QUnitReporter = function () {
    function QUnitReporter(adapter) {
        (0, _classCallCheck3.default)(this, QUnitReporter);

        this.adapter = adapter;

        this.lastError = null;
        this.currentTest = null;
        this.currentSuite = null;

        this.sentMessages = 0; // number of messages sent to the parent
        this.receivedMessages = 0; // number of messages received by the parent
        this.messageCounter = 0;
        this.messageUIDs = {
            suite: {},
            hook: {},
            test: {}
        };
    }

    (0, _createClass3.default)(QUnitReporter, [{
        key: 'setupEventListeners',
        value: function setupEventListeners() {
            var _this = this;

            (0, _keys2.default)(_get__('REPORTER_EVENTS')).forEach(function (e) {
                _this.adapter.runner.on(e, _this.emit.bind(_this, _get__('REPORTER_EVENTS')[e]));
            });
        }
    }, {
        key: 'processMessage',
        value: function processMessage(hookName, payload) {
            var params = { type: hookName, payload: payload };

            if (hookName === 'test:end') {
                this.lastError = this.lastError || payload.assertions.find(function (assertion) {
                    return !assertion.passed;
                });
                params.err = this.lastError;
            } else if (hookName === 'suite:end') {
                params.err = this.lastError;
                this.lastError = null;
            }

            var message = this.formatMessage(params);

            if (hookName.startsWith('test')) {
                this.currentTest = message;
            } else if (hookName.startsWith('suite')) {
                this.currentSuite = message;
            }

            return message;
        }
    }, {
        key: 'formatMessage',
        value: function formatMessage(params) {
            var message = {
                event: params.type,
                type: params.type
            };

            if (params.err) {
                var reason = 'Actual value ' + _get__('util').inspect(params.err.actual) + ' does not match expected value ' + _get__('util').inspect(params.err.expected) + '.';

                message.err = {
                    message: 'Description: ' + params.err.message + _get__('os').EOL + ('Reason: ' + reason),
                    stack: params.err.stack,
                    type: params.err.todo ? 'ToDo' : '',
                    expected: params.err.expected,
                    actual: params.err.actual
                };
            }

            if (params.payload) {
                message.title = params.payload.fullName.slice().reverse()[0];
                message.parent = params.payload.fullName.slice().reverse()[1];
                message.fullTitle = params.payload.fullName.join(' - ');
                message.pending = params.payload.status === 'skipped' || params.payload.status === 'todo';
                message.passed = params.payload.status === 'passed';
                message.duration = params.payload.runtime;
                message.file = undefined;

                // Add the current test title to the payload for cases where it helps to
                // identify the test, e.g. when running inside a beforeEach hook
                // message.currentTest = this.currentTest.title
            }

            return message;
        }
    }, {
        key: 'tagMessage',
        value: function tagMessage(message) {
            message.pid = process.pid;
            message.cid = this.adapter.cid;
            message.specs = this.adapter.specs;
            message.runner = (0, _defineProperty5.default)({}, this.adapter.cid, this.adapter.capabilities);

            var _generateUID = this.generateUID(message),
                uid = _generateUID.uid,
                parentUid = _generateUID.parentUid;

            message.uid = uid;
            message.parentUid = parentUid;
        }
    }, {
        key: 'emit',
        value: function emit(event, payload) {
            var message = this.processMessage(event, payload);

            this.tagMessage(message);

            // When starting a new test, propagate the details to the test runner so that
            // commands, results, screenshots and hooks can be associated with this test
            if (event === 'test:start') {
                this.sendInternal(event, message);
                // Send test:status message before test:end
            } else if (event === 'test:end') {
                if (message.pending) {
                    message.event = message.type = 'test:pending';
                } else if (message.passed) {
                    message.event = message.type = 'test:pass';
                } else {
                    message.event = message.type = 'test:fail';
                }
                this.sendMessage(message);

                message.event = message.type = event;
            }

            this.sendMessage(message);
        }
    }, {
        key: 'generateUID',
        value: function generateUID(message) {
            var uid, parentUid;

            switch (message.type) {
                case 'suite:start':
                    uid = this.getUID(message.title, 'suite', true);
                    parentUid = uid;
                    break;

                case 'suite:end':
                    uid = this.getUID(message.title, 'suite');
                    parentUid = uid;
                    break;

                case 'hook:start':
                    uid = this.getUID(message.title, 'hook', true);
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'hook:end':
                    uid = this.getUID(message.title, 'hook');
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'test:start':
                    uid = this.getUID(message.title, 'test', true);
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'test:pending':
                case 'test:end':
                case 'test:pass':
                case 'test:fail':
                    uid = this.getUID(message.title, 'test');
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                default:
                    throw new Error('Unknown message type : ' + message.type);
            }

            return {
                uid: uid,
                parentUid: parentUid
            };
        }
    }, {
        key: 'getUID',
        value: function getUID(title, type, start) {
            if (start !== true && this.messageUIDs[type][title]) {
                return this.messageUIDs[type][title];
            }

            var uid = title + this.messageCounter++;

            this.messageUIDs[type][title] = uid;

            return uid;
        }
    }, {
        key: 'sendInternal',
        value: function sendInternal(event, message) {
            process.emit(event, message);
        }
    }, {
        key: 'sendMessage',
        value: function sendMessage(message) {
            var _this2 = this;

            // console.log('sending message', message)

            this.send(message, null, {}, function () {
                return ++_this2.receivedMessages;
            });
            this.sentMessages++;
        }

        /**
         * reset globals to rewire it out in tests
         */

    }, {
        key: 'send',
        value: function send() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return process.send.apply(process, args);
        }

        /**
         * wait until all messages were sent to parent
         */

    }, {
        key: 'waitUntilSettled',
        value: function waitUntilSettled() {
            var _this3 = this;

            return new _promise2.default(function (resolve) {
                var start = new Date().getTime();
                var interval = setInterval(function () {
                    var now = new Date().getTime();

                    if (_this3.sentMessages !== _this3.receivedMessages && now - start < _get__('SETTLE_TIMEOUT')) return;
                    clearInterval(interval);
                    resolve();
                }, 100);
            });
        }
    }]);
    return QUnitReporter;
}();

exports.default = _get__('QUnitReporter');

var _RewiredData__ = (0, _create2.default)(null);

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
var _RewireAPI__ = {};

(function () {
    function addPropertyToAPIObject(name, value) {
        (0, _defineProperty3.default)(_RewireAPI__, name, {
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
        case 'REPORTER_EVENTS':
            return REPORTER_EVENTS;

        case 'util':
            return _util2.default;

        case 'os':
            return _os2.default;

        case 'SETTLE_TIMEOUT':
            return SETTLE_TIMEOUT;

        case 'QUnitReporter':
            return QUnitReporter;
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

var _typeOfOriginalExport = typeof QUnitReporter === 'undefined' ? 'undefined' : (0, _typeof3.default)(QUnitReporter);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty3.default)(QUnitReporter, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(QUnitReporter)) {
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