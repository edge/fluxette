import { vectorize, normalize, derive, fluxDispatch, waterfall } from './util';

export default class {
	constructor(stores = {}, auto = true) {
		// Top-level Stores
		this.stores = stores;
		// Optimized iteration vector
		this.vector = vectorize(stores);
		// Dispatcher
		this.hooks = [];
		// Action Stack
		this.history = [];
		// Middleware
		this.middleware = [];
		// State
		if (auto) {
			this.state = derive(this.stores);
		}
	}
	dispatch(...actions) {
		// Flatten and filter array of actions
		actions = normalize(actions);
		if (actions.length > 0) {
			// Call Middleware
			actions = waterfall(actions, this.middleware);
			// Dispatch
			fluxDispatch(this, actions);
		}
	}
}
