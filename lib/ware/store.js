'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _util = require('../util');

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