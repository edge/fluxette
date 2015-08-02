export let fluxDispatch = (flux, actions) => {
	// Push all actions onto stack
	flux.history.push(...actions);
	// Synchronously process all actions
	atomicDispatch(flux.vector, actions);
	// Derive state
	flux.state = derive(flux.stores);
	// Call all registered listeners
	callAll(flux.hooks, actions, flux.state);
};

// Flatten a Store into an array
export let vectorize = store => {
	if (store instanceof Function) {
		return [[store, x => x]];
	}
	else {
		let norm = [];
		$vectorize(store, norm, []);
		return norm;
	}
};

let $vectorize = (obj, into, cursor) => {
	for (let i in obj) {
		let store = obj[i];
		if (store instanceof Function) {
			into.push([store, makeCursor([...cursor, i])]);
		}
		else {
			$vectorize(store, into, [...cursor, i]);
		}
	}
};

// Derive state from stores
// If it's a store, just get its state
// Otherwise recursively derive
export let derive = store => store instanceof Function
	? store() : $derive(store);

let $derive = stores => {
	let obj = stores instanceof Array ? [] : {};
	for (let key in stores) {
		let store = stores[key];
		obj[key] = store instanceof Function
			? store()
			: $derive(store);
	}
	return obj;
};

// Flatten array and filter Objects
export let normalize = arr => {
	if (arr.length > 0) {
		let norm = [];
		$normalize(arr, norm);
		return norm;
	}
	else {
		return arr;
	}
};

let $normalize = (arr, into) => {
	for (let i = 0; i < arr.length; i++) {
		let val = arr[i];
		if (val instanceof Array) {
			$normalize(val, into);
		}
		else {
			if (val instanceof Object && val.type) {
				into.push(val);
			}
		}
	}
};

// Call each action in order with Store vector
export let atomicDispatch = (vector, actions) => {
	for (let i = 0; i < actions.length; i++) {
		let action = actions[i];

		if (action.type === initType) {
			// Call the stores with a specific rehydration action
			for (let j = 0; j < vector.length; j++) {
				let [store, cursor] = vector[j];
				store({ ...action, state: cursor(action.state) });
			}
		}
		else {
			// Just call the stores with the action
			for (let j = 0; j < vector.length; j++) {
				vector[j][0](action);
			}
		}
	}
};

// Call each in array of functions
export let callAll = (arr, ...data) => {
	for (let i = 0; i < arr.length; i++) {
		arr[i](...data);
	}
};

// Delete object from array
export let deleteFrom = (array, obj) => {
	let index = array.indexOf(obj);
	if (~index) {
		array.splice(index, 1);
	}
};

// Waterfall an an array of values through an array of functions
export let waterfall = (arr, functions) => {
	for (let i = 0; i < arr.length; i++) {
		let value = arr[i];
		for (let j = 0; j < functions.length; j++) {
			value = functions[j](value);
		}
		arr[i] = value;
	}
	return arr;
};

// Determine whether two arrays are functionally equivalent
export let same = (left, right) => {
	if (left.length !== right.length) {
		return false;
	}
	for (let i in left) {
		if (right.indexOf(left[i]) === -1) {
			return false;
		}
	}
	return true;
};

export let shallowEqual = (left, right) => {
	if ((left === right) || Object.is(left, right)) {
		return true;
	}

	let keys = Object.keys(left);

	if (!same(keys, Object.keys(right))) {
		return false;
	}

	for (let i in keys) {
		let key = keys[i];
		if (left[key] !== right[key]) {
			return false;
		}
	}

	return true;
};

export let makeCursor = properties =>
	obj => {
		let value = obj;
		for (let i = 0; i < properties.length; i++) {
			value = value[properties[i]];
			if (!(value instanceof Object)) {
				break;
			}
		}
		return value;
	};

export let listenerKey = (typeof Symbol !== 'undefined') ? Symbol() : '@@fluxetteListener';
export let initType = '@@fluxetteInit';
