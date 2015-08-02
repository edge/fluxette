/* global describe it */
import React, { addons } from 'react/addons';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
import Flux, { Store, connect, link, select } from '..';

chai.use(spies);

let { TestUtils: { Simulate, renderIntoDocument } } = addons;

const USER = {
	SETNAME: 'USER_SETNAME',
	SETEMAIL: 'USER_SETEMAIL'
};

describe('Flux', () => {

	describe('connect', () => {
		it('should hook component without specifier', () => {
			let flux = Flux({
				user: Store(() => ({ username: '', email: '' }), {
					[USER.SETNAME]: (action, state) => ({ ...state, username: action.name }),
					[USER.SETEMAIL]: (action, state) => ({ ...state, email: action.email })
				})
			});

			@connect(flux)
			class App extends React.Component {
				render() {
					return <Component ref='child' />;
				}
			}

			@link()
			class Component extends React.Component {
				submit() {
					let { flux } = this.context;
					let username = React.findDOMNode(this.refs.username).value;
					let email = React.findDOMNode(this.refs.email).value;
					flux.dispatch({ type: USER.SETNAME, name: username }, { type: USER.SETEMAIL, email });
				}
				render() {
					let { user } = this.state;
					return (
						<div>
							<input ref='username' />
							<input ref='email' />
							<button ref='submit' onClick={ ::this.submit } />
							Username: <span ref='username_label'>{ user.username }</span>
							Email: <span ref='email_label'>{ user.email }</span>
						</div>
					);
				}
			}

			let c = renderIntoDocument(<App />).refs.child;
			React.findDOMNode(c.refs.username).value = 'fluxette';
			React.findDOMNode(c.refs.email).value = 'fluxette@fluxette.github.io';
			Simulate.click(React.findDOMNode(c.refs.submit));
			expect(React.findDOMNode(c.refs.email_label).innerHTML).to.equal('fluxette@fluxette.github.io');
			expect(React.findDOMNode(c.refs.username_label).innerHTML).to.equal('fluxette');
		});
		it('should hook component with specifier', () => {
			let flux = Flux({
				user: Store(() => ({ username: '', email: '' }), {
					[USER.SETNAME]: (action, state) => ({ ...state, username: action.name }),
					[USER.SETEMAIL]: (action, state) => ({ ...state, email: action.email })
				})
			});

			@connect(flux)
			class App extends React.Component {
				render() {
					return <Component ref='child' />;
				}
			}

			@link(state => state.user)
			class Component extends React.Component {
				submit() {
					let { flux } = this.context;
					let username = React.findDOMNode(this.refs.username).value;
					let email = React.findDOMNode(this.refs.email).value;
					flux.dispatch({ type: USER.SETNAME, name: username }, { type: USER.SETEMAIL, email });
				}
				render() {
					let user = this.state;
					return (
						<div>
							<input ref='username' />
							<input ref='email' />
							<button ref='submit' onClick={ ::this.submit } />
							Username: <span ref='username_label'>{ user.username }</span>
							Email: <span ref='email_label'>{ user.email }</span>
						</div>
					);
				}
			}

			let c = renderIntoDocument(<App />).refs.child;
			React.findDOMNode(c.refs.username).value = 'fluxette';
			React.findDOMNode(c.refs.email).value = 'fluxette@fluxette.github.io';
			Simulate.click(React.findDOMNode(c.refs.submit));
			expect(React.findDOMNode(c.refs.email_label).innerHTML).to.equal('fluxette@fluxette.github.io');
			expect(React.findDOMNode(c.refs.username_label).innerHTML).to.equal('fluxette');
		});

		it('should not rerender if data has not changed', () => {
			let spy = chai.spy(() => {});
			let flux = Flux({
				user: Store(() => ({ username: '', email: '' }), {
					[USER.SETNAME]: (action, state) => ({ ...state, username: action.name }),
					[USER.SETEMAIL]: (action, state) => ({ ...state, email: action.email })
				})
			});

			@connect(flux)
			class App extends React.Component {
				render() {
					return <Component ref='child' />;
				}
			}

			@link(select(state => state.user))
			class Component extends React.Component {
				submit() {
					let { flux } = this.context;
					let username = React.findDOMNode(this.refs.username).value;
					let email = React.findDOMNode(this.refs.email).value;
					flux.dispatch({ type: USER.SETNAME, name: username }, { type: USER.SETEMAIL, email });
				}
				render() {
					spy();
					let user = this.state;
					return (
						<div>
							<input ref='username' />
							<input ref='email' />
							<button ref='submit' onClick={ ::this.submit } />
							Username: <span ref='username_label'>{ user.username }</span>
							Email: <span ref='email_label'>{ user.email }</span>
						</div>
					);
				}
			}

			let c = renderIntoDocument(<App />).refs.child;
			React.findDOMNode(c.refs.username).value = 'fluxette';
			React.findDOMNode(c.refs.email).value = 'fluxette@fluxette.github.io';
			Simulate.click(React.findDOMNode(c.refs.submit));
			expect(React.findDOMNode(c.refs.email_label).innerHTML).to.equal('fluxette@fluxette.github.io');
			expect(React.findDOMNode(c.refs.username_label).innerHTML).to.equal('fluxette');
			expect(spy).to.have.been.called.twice;
			flux.dispatch({ type: 'bogus-type' });
			expect(spy).to.have.been.called.twice;
		});

		it('should not fail on unmount', () => {
			let flux = Flux({});

			@link()
			class Child extends React.Component {
				render() {
					return <div />;
				}
			}

			@connect(flux)
			class Component extends React.Component {
				constructor() {
					super();
					this.state = {
						show: true
					};
				}
				toggle() {
					this.setState({
						show: !this.state.show
					});
				}
				render() {
					let toggle = <button ref='toggle' onClick={ ::this.toggle } />;
					return this.state.show
						? <div>
							<Child />
							{ toggle }
						</div>
						: <div>{ toggle }</div>;
				}
			}

			let c = renderIntoDocument(<Component />);
			Simulate.click(React.findDOMNode(c.refs.toggle));
		});
	});
});
