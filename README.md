# fluxette

`fluxette` is a minimalist yet powerful Flux implementation, inspired by ideas from [Dan Abramov (@gaearon)'s talk on Redux](https://www.youtube.com/watch?v=xsSnOQynTHs).

## Table of Contents

* [Why?](#why)
* [Install](#install)
* [Getting Started](#getting-started)
* [API](#api)
* [Debugging](#debugging)
* [Rehydration](#rehydration)
* [Isomorphic Flux](#isomorphic-flux)
* [Asynchronous](#asynchronous)
* [Middleware](#middleware)
* [Store Dependencies](#store-dependencies)
* [Tips](#tips)
* [Examples](#examples)
* [Testing](#testing)
* [Todo](#todo)

## Why?

Why `fluxette`? (Some buzzwords to attract you.)

* declarative and functional
* minimalist
* exhaustive
* modular
* isomorphic
* faciliated rehydration
* unopinionated
* loosely coupled
* unidirectional
* inverted control
* no boilerplate
* no switch statements!
* concise
* small
* React integration

## Install

```sh
$ npm i --save fluxette
```
Browser builds are available [here](https://github.com/edge/fluxette/tree/master/dist).

## Getting Started

As you will see, `fluxette` has a set recommended practices, but never forces you to do anything in a particular way.

Let's start off with creating your action types. While a module exporting constants isn't strictly necessary to use `fluxette`, they are recommended for a structured application. Constants are important, because they define the behaviors of your application (but don't worry, no switch statements). In smaller projects, such as the todo example, it is usually okay to omit a constants module. Constants will be used by your stores and in your actions. `fluxette` has no notion of action creators; they are simply userland functions that aid you in creating actions. You can use `fluxette` without any action creators at all.

**types.js**
```js
export default {
	USER: {
		SETNAME: 'USER_SETNAME',
		SETEMAIL: 'USER_SETEMAIL'
	},
	GAME: {
		ADDPOINTS: 'GAME_ADDPOINTS',
		RESET: 'GAME_RESET',
		WIN: 'GAME_WIN',
		LOSE: 'GAME_LOSE'
	}
}
```

Next, create your stores. Stores are values (primitives, arrays, objects) bound to pure functions (reducers) that reduce an array of actions into your state, much like an accumulator. All reducers should have the signature: `(state, action) => state`. While you don't necessarily have to use pure functions, it is recommended to do so to keep a maintainable project. `fluxette` provides a store factory, which takes an initial state and your reducers. The Store itself is a function, so if for some reason your use case cannot use the Store factory, you can use a plain function instead. Stores should be fast and synchronous, so that rehydration is easy.

**stores.js**
```js
import { Store } from 'fluxette';
import { USER, GAME } from './types';

export default {
	user: Store({ username: '', email: '' }, {
		[USER.SETNAME]: (state, action) => ({ ...state, username: action.name }),
		[USER.SETEMAIL]: (state, action) => ({ ...state, email: action.email })
	}),
	game: Store({ points: 0, wins: 0, losses: 0 }, {
		[GAME.ADDPOINTS]: (state, action) => ({ ...state, points: state.points + action.points }),
		[GAME.RESET]: state => ({ ...state, points: 0, wins: 0, losses: 0 }),
		[GAME.WIN]: state => ({ ...state, wins: state.wins + 1, points: 0 }),
		[GAME.LOSE]: state => ({ ...state, losses: state.losses + 1, points: 0 })
	})
}
```

Now, create your action creators. Action creators are not necessary, but are recommended in general. It is up to you on how you implement your action creators, but one good way is to use functions that take relevant arguments, and the `state` function from your base flux module if your action creator relies on state. Action creators should return an action or an array of actions. This allows them to also use other action creators for composable application behavior.

**creators.js**
```js
import { USER, GAME } from './types';
import { state } from '.';

let actions = {
	user: {
		setname: name => ({ type: USER.SETNAME, name }),
		setemail: email => ({ type: USER.SETEMAIL, email })
	},
	game: {
		addpoints: points => {
			let { game: { points: before } } = state();
			let total = before + points;
			if (total >= 1000) {
				return actions.game.win();
			}
			else if (total <= -1000) {
				return actions.game.lose();
			}
			return { type: GAME.ADDPOINTS, points };
		},
		reducepoints: points => actions.game.addpoints(-points),
		reset: () => ({ type: GAME.RESET }),
		win: () => ({ type: GAME.WIN }),
		lose: () => ({ type: GAME.LOSE })
	}
};

export default actions;
```

Finally, create your instance of `fluxette`.

**index.js**
```js
import Flux from 'fluxette';
import stores from './stores';

const flux = Flux(stores);

export default flux;
```

Now, simply dispatch your actions, and `fluxette` will take care of the rest.

**something.js**
```js
import { dispatch } from './flux';
import { user, game } from './flux/creators';

dispatch(user.setemail('user@example.org'));
dispatch(game.addpoints(100));
dispatch(game.reset());
```

## API

### Flux(stores)
The `fluxette` factory takes a single Store, an object with keys mapping to Stores, an array of Stores, or a mixture of the latter.

```js
const flux = Flux({
	storeA: @Store,
	storeB: @Store,
	domainA: {
		storeC: @Store
	},
	domainB: [
		storeD: @Store,
		storeE: @Store
	]
});
```

### flux.state()
`flux.state()` returns the object representation of the state. It is guaranteed to be the same between dispatches.

```js
import { state } from './flux';

state()

// {
//     storeA: @Store.state,
//     storeB: @Store.state,
//     domainA: {
//        storeC: @Store.state
//     },
//     domainB: [
//         @Store.state,
//         @Store.state
//     ]
// }
```

### flux.dispatch(...actions)
`flux.dispatch(...actions)` takes an action, an array of actions, or an argument list of both. It first passes them through middleware, synchronously runs them through each store, and calls any registered hooks afterwards.

```js
import { dispatch } from './flux';

// Single action
dispatch({ type: ACTION_TYPE });

// Array of actions
dispatch([{ type: ACTION_TYPE }, { type: OTHER_ACTION_TYPE }]);

// Argument list of actions
dispatch({ type: ACTION_TYPE }, { type: OTHER_ACTION_TYPE });
```

### flux.hydrate(actions)
`flux.hydrate(actions)` is a dispatch that does not flatten the actions or run them through middleware; its primary purpose is to allow you to imperatively rehydrate the stores.

```js
import { hydrate } from './flux';

// get action history
hydrate(historyArray);
```

### flux.proxy(fn)
`flux.proxy(fn)` registers a function as middleware that gets called before the dispatch. The middleware should have a signature of `actions => actions`. Middleware will be called in the order that they were registered. `Mapware` is great for action-specific middleware.

```js
import { proxy } from './flux';

// Transform the actions somehow
proxy(transform);

// Do anything with side effects
proxy(handler);
```

### flux.unproxy(fn)
`flux.unproxy(fn)` deregisters middleware that was `flux.proxy`ed before.

```js
import { proxy, unproxy } from './flux';

let fn = (actions) => {
	// do something
	return actions;
};

// fn will be called before dispatches
proxy(fn);

// fn will no longer be called before dispatches
unproxy(fn);
```

### flux.hook(fn)
`flux.hook(fn)` registers a function as a listener that gets called after the dispatch. The listener should have a signature of `(actions, state) => {}`. Listeners will be called in the order that they were registered.

```js
import { hook } from './flux';

// Log all new actions and the state to console
hook(::console.log);

// In a React class
hook((actions, state) => this.setState(state));
// However, it is better to use the flux.connect decorator

// Arbitrary function
hook((actions, state) => {
	// do something
});
```

### flux.unhook(fn)
`flux.unhook(fn)` deregisters a listener that was `flux.hook`ed before.

```js
import { hook, unhook } from './flux';

let fn = (actions, state) => {
	// do something
};

// fn will be called on dispatch
hook(fn);

// fn will no longer be called on state changes
unhook(fn);
```

### flux.history()
`flux.history()` returns the array of all actions that have been dispatched through `fluxette`. This is useful for rewinding state and de/rehydration.

```js
import { dispatch, history } from './flux';

dispatch(actionA, actionB, actionC);
dispatch([actionD, [actionE, actionF]], actionG);

history()
// [actionA, actionB, actionC, actionD, actionE, actionF, actionG]
```

### flux.connect([specifier], [identifier])
`flux.connect` is a class decorator that lets you easily integrate `fluxette` into your React classes. It takes an optional function that makes your component state more specific. Specifiers allow you to subscribe to Stores, as well as both coarser and finer grained updates. If your specifier subscribes to a Store or part of a store, your component will have a nice performance boost due to Store caching. It also takes an optional identifier ('flux' by default) that determines which key on your state it will be stored as.

```js
import { connect } from './flux';

@connect()
export default class extends React.Component {
	// ...
	render() {
		this.state.flux
		// result of flux.state()
	}
}

// or

@connect('domain')
export default class extends React.Component {
	// ...
	render() {
		this.state.domain
		// result of flux.state()
	}
}

// or

@connect(state => state.domain, 'domain')
export default class extends React.Component {
	// ...
	render() {
		this.state.domain
		// result of flux.state().domain
	}
}
```

### Store(state, reducers)
`Store` is a factory method that takes an initial state and an object containing reducers, with each key being your desired mapping from an action type to a reducer. It produces a pure state machine function that takes an action or an array of actions.

```js
import { Store } from 'fluxette';

const store = Store({}, {
	actionA: (state, action) => ({ ...state, a: action.item })
})
```

### Mapware(reducers)
Because Stores are just functions that reduce over an array of actions, you can use them as middleware and hooks. `fluxette` provides a further level of abstraction as `Mapware`, which reduces over actions themselves, instead of state.

```js
import { Mapware } from 'fluxette';
import { proxy } from './flux';

const ware = Mapware({
	actionA: (action) => ({ ...action, a: transform(action.a) })
})

proxy(ware);
```

## Debugging
Simply pass your logger/debugger to `flux.hook` when you want to log state changes, and `flux.unhook` when you're done. You can also use `Mapware` to map over actions by type.

```js
let logger = (actions, state) => {
	sendToDashboard(state);
	alertTimeMachine(actions);
}

let ware = Mapware({
	actionA: () => { console.log('Action A was dispatched'); }
});

hook(logger);
hook(ware);

unhook(logger);
unhook(ware);
```

## Rehydration
The action history is always available from `flux.history()`. When you want to save the state for later rehydration, simply serialize `flux.history` however you want and send it to the server.

When you want to retrieve the state from the previous session, send the state, deserialize it, and simply pass it through `flux.hydrate`.

```js
let history = getDeserializedActionHistoryPromise();

const flux = Flux(stores);

// components take default state

(async () => {
	flux.hydrate(await history);

	// flux is now rehydrated
})();
```

## Isomorphic Flux
Isomorphic Flux is as easy as creating a new instance of `fluxette`. It is your choice how you coordinate synchronization between the server and client.

```js
let flux = Flux(stores);
```

## Asynchronous
Because `fluxette` does not care about how your action creators work, asynchronous data fetching should not be a problem in your application. This makes it easy to work with `React Router`. When you want to update your state, simply call `flux.dispatch(action)`. This can be from a callback, a Promise resolution/await, or something else. It is also possible to write a Promise middleware to simplify your asynchronous I/O tasks.

```js
async function doSomething(data) {
	let result = await somePromise(data);
	dispatch(actions.doSomething(result));
}

doSomething(foo);
```

For your classic request/success/failure behaviors, the following approach is viable:
```js
// actions
let api = {
	items: {
		request: () => ({ type: API.ITEMS.REQUEST }),
		done: items => ({ type: API.ITEMS.DONE, items }),
		fail: error => ({ type: API.ITEMS.FAIL, error })
	}
};

// async helper
let getItems = () => {
	dispatch(api.items.request());
	asyncRequest((err, res) => {
		if (err) {
			flux.dispatch(api.items.fail(err));
		}
		else {
			flux.dispatch(api.items.done(res.items));
		}
	});
}
```

## Middleware
Middleware are a simple but powerful addition to the dispatcher, and `fluxette` allows you to hook your own middleware into the dispatch cycle. Every time a dispatch is made, each middleware will be called in order with the array of actions being dispatched, and the dispatcher expects it to return a new array of actions. The stores will only ever see actions returned by the middleware. This allows you to transform the actions, drop actions, or perform any other behavior required by your application, such as setting cookies and localStorage. This solves the problem of discerning between the Store and non-Store aspects of eminent data. `fluxette` also provides the `Mapware` factory to automatically reduce over each action by type.

```js
const ware = actions => actions.map(action =>
	action.type == ACTION_TYPE
		? { ...action, extra: 'extra' }
		: action);

// or

const ware = Mapware({
	[ACTION_TYPE]: action => ({ ...action, extra: 'extra' })
})

flux.proxy(ware);
```

## Store Dependencies
Store dependencies in vanilla flux is handled by using `waitFor`, but `waitFor` is hard to trace, and may result in unpredictable application behavior, such as infinite loops. The `fluxette` way to handle store dependencies is to instead split an action into two semantic actions, which will be dispatched in order. This is known as action-splitting, and it allows for declarative store dependencies, simultaneously improving clarity and preventing any possibility of mutual dependencies. In most Flux implementations, this would not be a viable solution, as dispatching twice results in an extra setState on each component. Since `fluxette` allows you to dispatch arrays of actions, atomic action handling of arrays is possible, and only one setState is called once the array has been fully processed. A dependency refactor should usually not involve changing component code; you can just make the relevant action creator return an array of actions instead. If you do not want to use action-splitting, you can use the [redux way](https://gist.github.com/gaearon/d77ca812015c0356654f) as well.

## Tips
The `fluxette` factory is essentially a wrapper around the `fluxette` constructor, which autobinds methods and hides properties for your convenience and safety. If you use the factory, you can individually import methods from your base flux module. It is then entirely possible to use `fluxette` without import flux itself.

You can `import { Fluxette } from 'fluxette';` if you desire, thus allowing you to extend `fluxette` in whatever way would benefit your application.

Think of hooks as the post-dispatch counterpart of middleware. In fact, you can reuse some middleware as hooks, and vice-versa.

If you change the state, make sure that you return something with a different reference in order for your components to update.

`fluxette` works best when its internals are asynchronous; this ensures that it is fast. It is recommended that you keep asynchronous code outside of stores, but you can write asynchronous middleware if you wish.

In `fluxette`, *everything* is a function! That means that your Stores, middleware, and hooks can be plain functions if you so desire.

Actions dictate the state of your application. You should structure your application so that your application would have the same state whether the actions were processed by normal user interaction or by rehydration.

## Examples
Examples can be found [here](https://github.com/edge/fluxette/tree/master/examples).

## Testing
```sh
# npm i -g testem
$ npm test
```

## Todo
* implement rewinding
* React and non-React builds
* add ~~lint~~, code coverage, CI, badges, and all that jazz
* add more examples (async, router, ~~flux-comparison~~, etc.)
* rewrite docs
* submit to HN
