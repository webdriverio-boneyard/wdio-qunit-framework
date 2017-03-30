'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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

            (0, _keys2.default)(REPORTER_EVENTS).forEach(function (e) {
                _this.adapter.runner.on(e, _this.emit.bind(_this, REPORTER_EVENTS[e]));
            });
        }
    }, {
        key: 'prepareMessage',
        value: function prepareMessage(hookName, payload) {
            var params = { type: hookName, payload: payload };

            // console.log('lastError', this.lastError)
            if (hookName === 'test:end') {
                this.lastError = this.lastError || payload.assertions.find(function (assertion) {
                    return !assertion.passed;
                });
                params.err = this.lastError;
            } else if (hookName === 'suite:end') {
                params.err = this.lastError;
                this.lastError = null;
            }

            params.err = this.lastError;
            return this.formatMessage(params);
        }
    }, {
        key: 'formatMessage',
        value: function formatMessage(params) {
            var message = {
                type: params.type
            };

            if (params.err) {
                message.err = {
                    message: params.err.message,
                    stack: params.err.stack,
                    type: params.err.todo ? 'ToDo' : '',
                    expected: params.err.expected,
                    actual: params.err.actual
                };
            }

            if (params.payload) {
                message.title = params.payload.fullName[params.payload.fullName.length - 1];
                message.parent = params.payload.fullName[params.payload.fullName.length - 2];
                message.fullTitle = params.payload.fullName.join(' - ');
                message.pending = params.payload.status === 'skipped' || params.payload.status === 'todo' || false;
                message.file = undefined;

                // FIXME
                // Add the current test title to the payload for cases where it helps to
                // identify the test, e.g. when running inside a beforeEach hook
                if (params.payload.ctx && params.payload.ctx.currentTest) {
                    message.currentTest = params.payload.ctx.currentTest.title;
                }

                if (params.type.match(/Test/i)) {
                    message.passed = params.payload.status === 'passed';
                    message.duration = params.payload.runtime;
                }
            }

            // console.log('message', message)
            return message;
        }
    }, {
        key: 'emit',
        value: function emit(event, payload) {
            var _this2 = this;

            var message = this.prepareMessage(event, payload);

            message.cid = this.adapter.cid;
            message.specs = this.adapter.specs;
            message.event = event;
            message.runner = {};
            message.runner[this.adapter.cid] = this.adapter.capabilities;

            var _generateUID = this.generateUID(message),
                uid = _generateUID.uid,
                parentUid = _generateUID.parentUid;

            message.uid = uid;
            message.parentUid = parentUid;

            // When starting a new test, propagate the details to the test runner so that
            // commands, results, screenshots and hooks can be associated with this test
            if (event === 'test:start') {
                this.sendInternal(event, message);
            }

            this.send(message, null, {}, function () {
                return ++_this2.receivedMessages;
            });
            this.sentMessages++;
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

                    if (_this3.sentMessages !== _this3.receivedMessages && now - start < SETTLE_TIMEOUT) return;
                    clearInterval(interval);
                    resolve();
                }, 100);
            });
        }
    }]);
    return QUnitReporter;
}();

exports.default = QUnitReporter;
module.exports = exports['default'];