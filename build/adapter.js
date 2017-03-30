'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.adapterFactory = exports.QUnitAdapter = undefined;

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

        this.runner = global.QUnit = _qunitjs2.default;

        this.hooker = new _hooker2.default(this);
        this.reporter = new _reporter2.default(this);
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
                        module = _path2.default.join(process.cwd(), module);
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

var _QUnitAdapter = QUnitAdapter;
var adapterFactory = {};

adapterFactory.run = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cid, config, specs, capabilities) {
        var adapter;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        adapter = new _QUnitAdapter(cid, config, specs, capabilities);
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

exports.default = adapterFactory;
exports.QUnitAdapter = QUnitAdapter;
exports.adapterFactory = adapterFactory;