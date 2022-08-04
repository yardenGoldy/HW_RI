import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';

export type AppState = {
	tickets?: Ticket[],
	search: string;
	showContents: any;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		showContents: {}
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	onClickTicket = (id: string) => {
		this.setState(prevState => {
			let showContents = Object.assign({}, prevState.showContents);
			showContents[id] = !showContents[id];
			return {showContents};
		})
	}

	renderTickets = (tickets: Ticket[]) => {

		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));


		return (<ul className='tickets'>
			{filteredTickets.map((ticket) => (
			<li key={ticket.id} className='ticket' onClick={this.onClickTicket.bind(this, ticket.id)}>
				<h5 className='title'>{ticket.title}</h5>
				<footer>
					<div className='meta-data'>
						By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}
						<pre className='content'>{this.state.showContents[ticket.id] === true ? ticket.content: null}</pre>
					</div>
				</footer>
			</li>))}
		</ul>);
	}

	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	render() {	
		const {tickets} = this.state;

		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			{tickets ? <div className='results'>Showing {tickets.length} results</div> : null }	
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;