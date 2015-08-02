'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var _bind = Function.prototype.bind;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flux = require('./flux');

var _flux2 = _interopRequireDefault(_flux);

var _wareStore = require('./ware/store');

var _wareStore2 = _interopRequireDefault(_wareStore);

var _wareMapware = require('./ware/mapware');

var _wareMapware2 = _interopRequireDefault(_wareMapware);

var _wareSelect = require('./ware/select');

var _wareSelect2 = _interopRequireDefault(_wareSelect);

var _reactConnect = require('./react/connect');

var _reactConnect2 = _interopRequireDefault(_reactConnect);

var _reactLink = require('./react/link');

var _reactLink2 = _interopRequireDefault(_reactLink);

var _util = require('./util');

var init = function init() {
	return { type: _util.initType, state: {} };
};

exports.Fluxette = _flux2['default'];
exports.Store = _wareStore2['default'];
exports.Mapware = _wareMapware2['default'];
exports.connect = _reactConnect2['default'];
exports.link = _reactLink2['default'];
exports.select = _wareSelect2['default'];
exports.init = init;

exports['default'] = function () {
	var _context;

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var flux = new (_bind.apply(_flux2['default'], [null].concat(args)))();
	return {
		dispatch: flux.dispatch.bind(flux),
		hydrate: function hydrate(actions) {
			return (0, _util.fluxDispatch)(flux, actions);
		},
		state: function state() {
			return flux.state;
		},
		history: function history() {
			return flux.history;
		},
		proxy: (_context = flux.middleware).push.bind(_context),
		unproxy: function unproxy(fn) {
			(0, _util.deleteFrom)(flux.middleware, fn);
		},
		hook: (_context = flux.hooks).push.bind(_context),
		unhook: function unhook(fn) {
			(0, _util.deleteFrom)(flux.hooks, fn);
		}
	};
};