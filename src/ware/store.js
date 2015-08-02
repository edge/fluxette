import { initType } from '../util';

export default function(statefn = () => ({}), reducers = {}) {
	let state;
	return action => {
		if (action === undefined) {
			if (state === undefined) {
				state = statefn();
			}
		}
		else {
			let { type } = action;
			if (type === initType) {
				// Rehydrate
				state = action.state !== undefined
					? action.state : statefn();
			}
			else {
				if (state === undefined) {
					state = statefn();
				}
				// Call the appropriate reducer with the state and the action
				let reducer = reducers[type];
				if (reducer) {
					let redux = reducer(action, state);
					if (redux !== undefined) {
						state = redux;
					}
				}
			}
		}
		return state;
	};
}
