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