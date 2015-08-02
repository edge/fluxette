'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require('./util');

var _default = (function () {
	function _default() {
		var stores = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var auto = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

		_classCallCheck(this, _default);

		// Top-level Stores
		this.stores = stores;
		// Optimized iteration vector
		this.vector = (0, _util.vectorize)(stores);
		// Dispatcher
		this.hooks = [];
		// Action Stack
		this.history = [];
		// Middleware
		this.middleware = [];
		// State
		if (auto) {
			this.state = (0, _util.derive)(this.stores);
		}
	}

	_createClass(_default, [{
		key: 'dispatch',
		value: function dispatch() {
			for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
				actions[_key] = arguments[_key];
			}

			// Flatten and filter array of actions
			actions = (0, _util.normalize)(actions);
			if (actions.length > 0) {
				// Call Middleware
				actions = (0, _util.waterfall)(actions, this.middleware);
				// Dispatch
				(0, _util.fluxDispatch)(this, actions);
			}
		}
	}]);

	return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];