(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["fluxette"] = factory(require("react"));
	else
		root["fluxette"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var _bind = Function.prototype.bind;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _flux = __webpack_require__(3);

	var _flux2 = _interopRequireDefault(_flux);

	var _wareStore = __webpack_require__(8);

	var _wareStore2 = _interopRequireDefault(_wareStore);

	var _wareMapware = __webpack_require__(6);

	var _wareMapware2 = _interopRequireDefault(_wareMapware);

	var _wareSelect = __webpack_require__(7);

	var _wareSelect2 = _interopRequireDefault(_wareSelect);

	var _reactConnect = __webpack_require__(4);

	var _reactConnect2 = _interopRequireDefault(_reactConnect);

	var _reactLink = __webpack_require__(5);

	var _reactLink2 = _interopRequireDefault(_reactLink);

	var _util = __webpack_require__(1);

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

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var fluxDispatch = function fluxDispatch(flux, actions) {
		var _flux$history;

		// Push all actions onto stack
		(_flux$history = flux.history).push.apply(_flux$history, _toConsumableArray(actions));
		// Synchronously process all actions
		atomicDispatch(flux.vector, actions);
		// Derive state
		flux.state = derive(flux.stores);
		// Call all registered listeners
		callAll(flux.hooks, actions, flux.state);
	};

	// Flatten a Store into an array
	exports.fluxDispatch = fluxDispatch;
	var vectorize = function vectorize(store) {
		if (store instanceof Function) {
			return [[store, function (x) {
				return x;
			}]];
		} else {
			var norm = [];
			$vectorize(store, norm, []);
			return norm;
		}
	};

	exports.vectorize = vectorize;
	var $vectorize = function $vectorize(obj, into, cursor) {
		for (var i in obj) {
			var store = obj[i];
			if (store instanceof Function) {
				into.push([store, makeCursor([].concat(_toConsumableArray(cursor), [i]))]);
			} else {
				$vectorize(store, into, [].concat(_toConsumableArray(cursor), [i]));
			}
		}
	};

	// Derive state from stores
	// If it's a store, just get its state
	// Otherwise recursively derive
	var derive = function derive(store) {
		return store instanceof Function ? store() : $derive(store);
	};

	exports.derive = derive;
	var $derive = function $derive(stores) {
		var obj = stores instanceof Array ? [] : {};
		for (var key in stores) {
			var store = stores[key];
			obj[key] = store instanceof Function ? store() : $derive(store);
		}
		return obj;
	};

	// Flatten array and filter Objects
	var normalize = function normalize(arr) {
		if (arr.length > 0) {
			var norm = [];
			$normalize(arr, norm);
			return norm;
		} else {
			return arr;
		}
	};

	exports.normalize = normalize;
	var $normalize = function $normalize(arr, into) {
		for (var i = 0; i < arr.length; i++) {
			var val = arr[i];
			if (val instanceof Array) {
				$normalize(val, into);
			} else {
				if (val instanceof Object && val.type) {
					into.push(val);
				}
			}
		}
	};

	// Call each action in order with Store vector
	var atomicDispatch = function atomicDispatch(vector, actions) {
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];

			if (action.type === initType) {
				// Call the stores with a specific rehydration action
				for (var j = 0; j < vector.length; j++) {
					var _vector$j = _slicedToArray(vector[j], 2);

					var store = _vector$j[0];
					var cursor = _vector$j[1];

					store(_extends({}, action, { state: cursor(action.state) }));
				}
			} else {
				// Just call the stores with the action
				for (var j = 0; j < vector.length; j++) {
					vector[j][0](action);
				}
			}
		}
	};

	// Call each in array of functions
	exports.atomicDispatch = atomicDispatch;
	var callAll = function callAll(arr) {
		for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			data[_key - 1] = arguments[_key];
		}

		for (var i = 0; i < arr.length; i++) {
			arr[i].apply(arr, data);
		}
	};

	// Delete object from array
	exports.callAll = callAll;
	var deleteFrom = function deleteFrom(array, obj) {
		var index = array.indexOf(obj);
		if (~index) {
			array.splice(index, 1);
		}
	};

	// Waterfall an an array of values through an array of functions
	exports.deleteFrom = deleteFrom;
	var waterfall = function waterfall(arr, functions) {
		for (var i = 0; i < arr.length; i++) {
			var value = arr[i];
			for (var j = 0; j < functions.length; j++) {
				value = functions[j](value);
			}
			arr[i] = value;
		}
		return arr;
	};

	// Determine whether two arrays are functionally equivalent
	exports.waterfall = waterfall;
	var same = function same(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		for (var i in left) {
			if (right.indexOf(left[i]) === -1) {
				return false;
			}
		}
		return true;
	};

	exports.same = same;
	var shallowEqual = function shallowEqual(left, right) {
		if (left === right || Object.is(left, right)) {
			return true;
		}

		var keys = Object.keys(left);

		if (!same(keys, Object.keys(right))) {
			return false;
		}

		for (var i in keys) {
			var key = keys[i];
			if (left[key] !== right[key]) {
				return false;
			}
		}

		return true;
	};

	exports.shallowEqual = shallowEqual;
	var makeCursor = function makeCursor(properties) {
		return function (obj) {
			var value = obj;
			for (var i = 0; i < properties.length; i++) {
				value = value[properties[i]];
				if (!(value instanceof Object)) {
					break;
				}
			}
			return value;
		};
	};

	exports.makeCursor = makeCursor;
	var listenerKey = typeof Symbol !== 'undefined' ? Symbol() : '@@fluxetteListener';
	exports.listenerKey = listenerKey;
	var initType = '@@fluxetteInit';
	exports.initType = initType;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _util = __webpack_require__(1);

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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _react = __webpack_require__(2);

	exports['default'] = function (flux) {
		return function (Component) {
			return (function (_Component) {
				_inherits(_class, _Component);

				function _class() {
					_classCallCheck(this, _class);

					_get(Object.getPrototypeOf(_class.prototype), 'constructor', this).apply(this, arguments);
				}

				_createClass(_class, [{
					key: 'getChildContext',
					value: function getChildContext() {
						return { flux: flux };
					}
				}], [{
					key: 'childContextTypes',
					value: {
						flux: _react.PropTypes.object.isRequired
					},
					enumerable: true
				}]);

				return _class;
			})(Component);
		};
	};

	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _util = __webpack_require__(1);

	var _react = __webpack_require__(2);

	exports['default'] = function () {
		var selector = arguments.length <= 0 || arguments[0] === undefined ? function (x) {
			return x;
		} : arguments[0];

		return function (Component) {
			return (function (_Component) {
				_inherits(_class, _Component);

				_createClass(_class, null, [{
					key: 'contextTypes',
					value: {
						flux: _react.PropTypes.object.isRequired
					},
					enumerable: true
				}]);

				function _class() {
					var _this = this;

					_classCallCheck(this, _class);

					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					_get(Object.getPrototypeOf(_class.prototype), 'constructor', this).apply(this, args);
					var flux = this.context.flux;

					// Initial state
					this.state = selector(flux.state());
					// Cacher function
					var listener = this[_util.listenerKey] = function (actions, state) {
						var newState = selector(state);
						if (!(0, _util.shallowEqual)(_this.state, newState)) {
							_get(Object.getPrototypeOf(_class.prototype), 'setState', _this).call(_this, newState);
						}
					};
					// Register setState
					flux.hook(listener);
				}

				_createClass(_class, [{
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {
						if (_get(Object.getPrototypeOf(_class.prototype), 'componentWillUnmount', this)) {
							for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
								args[_key2] = arguments[_key2];
							}

							_get(Object.getPrototypeOf(_class.prototype), 'componentWillUnmount', this).apply(this, args);
						}
						// Unregister setState
						this.context.flux.unhook(this[_util.listenerKey]);
					}
				}]);

				return _class;
			})(Component);
		};
	};

	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports["default"] = function () {
		var reducers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		return function (actions) {
			// If no actions, just return them
			if (actions !== undefined) {
				// Call the appropriate reducer with the action
				if (actions instanceof Array) {
					for (var i = 0; i < actions.length; i++) {
						var action = actions[i];
						var reducer = reducers[action.type];
						if (reducer) {
							reducer(action);
						}
					}
				} else {
					var reducer = reducers[actions.type];
					if (reducer) {
						var redux = reducer(actions);
						if (redux !== undefined) {
							actions = redux;
						}
					}
				}
			}
			return actions;
		};
	};

	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _util = __webpack_require__(1);

	exports['default'] = function (getters) {
		var deriver = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
			return x;
		} : arguments[1];

		// Ensure Array
		if (!(getters instanceof Array)) {
			getters = [getters];
		}
		// Caches
		var lastGets = [],
		    derived = {};
		return function (state) {
			// New selections
			var gets = getters.map(function (fn) {
				return fn(state);
			});
			// If selections are different, invalidate
			if (!(0, _util.same)(lastGets, gets)) {
				derived = deriver.apply(undefined, _toConsumableArray(gets));
				lastGets = gets;
			}
			return derived;
		};
	};

	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _util = __webpack_require__(1);

	exports['default'] = function () {
		var statefn = arguments.length <= 0 || arguments[0] === undefined ? function () {
			return {};
		} : arguments[0];
		var reducers = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var state = undefined;
		return function (action) {
			if (action === undefined) {
				if (state === undefined) {
					state = statefn();
				}
			} else {
				var type = action.type;

				if (type === _util.initType) {
					// Rehydrate
					state = action.state !== undefined ? action.state : statefn();
				} else {
					if (state === undefined) {
						state = statefn();
					}
					// Call the appropriate reducer with the state and the action
					var reducer = reducers[type];
					if (reducer) {
						var redux = reducer(action, state);
						if (redux !== undefined) {
							state = redux;
						}
					}
				}
			}
			return state;
		};
	};

	module.exports = exports['default'];

/***/ }
/******/ ])
});
;