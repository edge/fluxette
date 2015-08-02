/* global describe it */
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import Flux, { Store, Mapware, init } from '..';

chai.use(spies);

const TYPES = {
	A: 'A',
	B: 'B',
	BOGUS: 'BOGUS'
};

describe('Flux', () => {

	describe('factory', () => {
		it('should properly construct flux class', () => {
			let flux = Flux({});
			expect(flux).to.have.property('history')
				.that.is.an.instanceof(Function);
			expect(flux).to.have.property('state')
				.that.is.an.instanceof(Function);
			expect(flux).to.have.property('dispatch')
				.that.is.an.instanceof(Function);
			expect(flux).to.have.property('hook')
				.that.is.an.instanceof(Function);
			expect(flux).to.have.property('unhook')
				.that.is.an.instanceof(Function);
		});
	});

	describe('state', () => {
		it('should return state when called', () => {
			let flux = Flux({
				a: { a: Store(() => 0), b: Store(() => '') },
				b: { a: Store(() => ({})), b: Store(() => []) }
			});
			expect(flux.state()).to.deep.equal({
				a: { a: 0, b: '' },
				b: { a: {}, b: [] }
			});

			flux = Flux(Store(() => 0));
			expect(flux.state()).to.equal(0);
		});
		it('should stay the same between dispatches', () => {
			let flux = Flux({
				a: { a: Store(() => 0), b: Store(() => '') },
				b: { a: Store(() => ({})), b: Store(() => []) }
			});
			expect(flux.state()).to.equal(flux.state());
		});
	});

	describe('dispatch', () => {
		it('should update state when called', () => {
			let flux = Flux({
				a: Store(() => 0, {
					[TYPES.A]: ($, state) => state + 1,
					[TYPES.B]: ($, state) => state - 1
				}),
				b: Store(() => '', {
					[TYPES.A]: ($, state) => state + 'a',
					[TYPES.B]: ($, state) => state + 'b'
				})
			});
			flux.dispatch({ type: TYPES.A });
			expect(flux.state()).to.deep.equal({
				a: 1,
				b: 'a'
			});
			flux.dispatch({ type: TYPES.B });
			expect(flux.state()).to.deep.equal({
				a: 0,
				b: 'ab'
			});
		});
		it('should dispatch arrays', () => {
			let flux = Flux({
				a: Store(() => 0, {
					[TYPES.A]: ($, state) => state + 1,
					[TYPES.B]: ($, state) => state - 1
				}),
				b: Store(() => '', {
					[TYPES.A]: ($, state) => state + 'a',
					[TYPES.B]: ($, state) => state + 'b'
				})
			});
			flux.dispatch([{ type: TYPES.A }, { type: TYPES.B }]);
			expect(flux.state()).to.deep.equal({
				a: 0,
				b: 'ab'
			});
		});
		it('should dispatch argument lists', () => {
			let flux = Flux({
				a: Store(() => 0, {
					[TYPES.A]: ($, state) => state + 1,
					[TYPES.B]: ($, state) => state - 1
				}),
				b: Store(() => '', {
					[TYPES.A]: ($, state) => state + 'a',
					[TYPES.B]: ($, state) => state + 'b'
				})
			});
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B });
			expect(flux.state()).to.deep.equal({
				a: 0,
				b: 'ab'
			});
		});
		it('should not dispatch when nothing is passed', () => {
			let flux = Flux({
				a: Store(() => 0, {
					[TYPES.A]: ($, state) => state + 1,
					[TYPES.B]: ($, state) => state - 1
				}),
				b: Store(() => '', {
					[TYPES.A]: ($, state) => state + 'a',
					[TYPES.B]: ($, state) => state + 'b'
				})
			});
			let spy = chai.spy(() => {});
			flux.hook(spy);
			flux.dispatch();
			expect(spy).not.to.have.been.called;
		});
		it('should not dispatch when non-Objects are passed', () => {
			let flux = Flux({
				a: Store(() => 0, {
					[TYPES.A]: ($, state) => state + 1,
					[TYPES.B]: ($, state) => state - 1
				}),
				b: Store(() => '', {
					[TYPES.A]: ($, state) => state + 'a',
					[TYPES.B]: ($, state) => state + 'b'
				})
			});
			let spy = chai.spy(() => {});
			flux.hook(spy);
			flux.dispatch(undefined, [0, false, null]);
			expect(spy).not.to.have.been.called;
		});
		it('should call middleware when called', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let spy = chai.spy(action => action.type === TYPES.A
					? { ...action, extra: 'ex'} : action);
			flux.proxy(spy);
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B });
			expect(spy).to.have.been.called.twice;
			expect(flux.history()).to.deep.equal([{ type: TYPES.A, extra: 'ex' }, { type: TYPES.B }]);
		});
		it('can declaratively rehydrate', () => {
			let flux = Flux({
				a: Store(),
				b: { a: Store(), b: Store() }
			}, false);
			flux.dispatch({ ...init(),
				state: {
					a: 6,
					b: { a: 7, b: 8 }
				}
			});
			expect(flux.state()).to.deep.equal({
				a: 6,
				b: { a: 7, b: 8 }
			});
			flux.dispatch({ ...init(),
				state: {
					a: 9,
					b: { a: 10, b: 11 }
				}
			});
			expect(flux.state()).to.deep.equal({
				a: 9,
				b: { a: 10, b: 11 }
			});
		});
	});

	describe('hydrate', () => {
		it('should recover state from history', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B });
			let flux2 = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			flux2.hydrate(flux.history());
			expect(flux2.state()).to.deep.equal(flux.state());
		});
	});

	describe('history', () => {
		it('should be updated on dispatch', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B }, { type: TYPES.BOGUS });
			expect(flux.history()).to.deep.equal([{ type: TYPES.A }, { type: TYPES.B }, { type: TYPES.BOGUS }]);
		});
	});

	describe('hook', () => {
		it('should call listeners by the number of valid dispatches', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let spy = chai.spy(() => {});
			flux.hook(spy);
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B });
			flux.dispatch();
			flux.dispatch(false, null);
			flux.dispatch([{ type: TYPES.A }, { type: TYPES.B }]);
			flux.dispatch({ type: TYPES.A });
			expect(spy).to.have.been.called.exactly(3);
		});
		it('should call listeners with (actions, state)', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let spy = chai.spy((actions, state) => {
				expect(actions).to.deep.equal([{ type: TYPES.A }, { type: TYPES.B }, { type: TYPES.BOGUS }]);
				expect(state).to.equal(flux.state());
			});
			flux.hook(spy);
			flux.dispatch([{ type: TYPES.A }, { type: TYPES.B }], { type: TYPES.BOGUS });
			expect(spy).to.have.been.called.once;
		});
	});

	describe('unhook', () => {
		it('should not call listeners after unhook', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let spy = chai.spy(() => {});
			flux.hook(spy);
			flux.dispatch({ type: TYPES.A }, { type: TYPES.B });
			flux.dispatch();
			flux.dispatch(false, null);
			flux.dispatch([{ type: TYPES.A }, { type: TYPES.B }]);
			flux.unhook(spy);
			flux.dispatch({ type: TYPES.A });
			expect(spy).to.have.been.called.twice;
		});
	});

	describe('Mapware', () => {
		it('can be used as middleware', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let ware = chai.spy(Mapware({
				[TYPES.A]: action => ({ ...action, type: TYPES.B })
			}));
			flux.proxy(ware);
			flux.dispatch({ type: TYPES.A });
			expect(ware).to.have.been.called.once;
			expect(flux.history()).to.deep.equal([{ type: TYPES.B }]);
		});
		it('can be used as a hook', () => {
			let flux = Flux(Store(() => 0, {
				[TYPES.A]: ($, state) => state + 1,
				[TYPES.B]: ($, state) => state - 1
			}));
			let spy = chai.spy(() => {});
			let ware = chai.spy(Mapware({
				[TYPES.A]: spy
			}));
			flux.hook(ware);
			flux.dispatch({ type: TYPES.A });
			flux.dispatch({ type: TYPES.B });
			expect(ware).to.have.been.called.twice;
			expect(spy).to.have.been.called.once;
		});
	});

});
