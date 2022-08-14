import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
import InfiniteScroll from 'react-infinite-scroll-component';

export type AppState = {
	tickets?: Ticket[],
	search: string;
	showContents: any;
	hiddenTickets: any;
	ticketHoverId: string;
	hasMoreTickets: boolean;
	totalNumberOfTickets?: number;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		showContents: {},
		hiddenTickets: {},
		ticketHoverId: '',
		hasMoreTickets: true
	}

	searchDebounce: any = null;
	countPage = 1

	async componentDidMount() {
		const result = await api.getTickets()
		this.setState({
			tickets: result.tickets,
			totalNumberOfTickets: result.cardinality
		});
	}

	onClickTicket = (id: string) => {
		this.setState(prevState => {
			let showContents = Object.assign({}, prevState.showContents);
			showContents[id] = !showContents[id];
			return {showContents};
		})
	}

	showAll = () => {
		this.setState({
			hiddenTickets: {}
		})
	}

	onClickHideButton = (id: string) => {
		this.setState(prevState => {
			let hiddenTickets = Object.assign({}, prevState.hiddenTickets);
			hiddenTickets[id] = !hiddenTickets[id];
			return {hiddenTickets};
		})
	}

	handleMouseOver = (id: string) => {
		if(this.state.ticketHoverId !== id)
		{
			this.setState({
				ticketHoverId: id
			})
		}
	}

	handleMouseOut = (id: string) => {
		if(this.state.ticketHoverId === id)
		{
			this.setState({
				ticketHoverId: ''
			})
		}
	}
	async copyTicket(ticket: Ticket){
		const copiedTicket = Object.assign({}, ticket) as Ticket;
		delete copiedTicket.id;
		const newTicket = await api.addTicket(copiedTicket);
		this.setState(prevState => ({
			tickets: [...prevState.tickets!, newTicket]
		  }))
	}

	fetchMoreData = () => {
		this.countPage++;
		if (this.state.tickets!.length >= this.state.totalNumberOfTickets!) {
		  this.setState({ hasMoreTickets: false });
		  return;
		}
		// a fake async api call like which sends
		// 20 more records in .5 secs
		setTimeout(async () => {
			let result = await api.getTickets(this.countPage)
		  this.setState({
			tickets: this.state.tickets!.concat(result.tickets),
			totalNumberOfTickets: result.cardinality
		  });
		}, 500);
	  };

	renderTickets = (tickets: Ticket[]) => {

		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));


		return (<ul className='tickets'>
			<InfiniteScroll
          dataLength={filteredTickets.length}
          next={this.fetchMoreData}
          hasMore={this.state.hasMoreTickets}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
			{filteredTickets.map((ticket) => (
			!this.state.hiddenTickets[ticket.id!] ?
			<div key={ticket.id + "ticket_wrapper"} onMouseEnter={this.handleMouseOver.bind(this, ticket.id!)} onMouseLeave={this.handleMouseOut.bind(this, ticket.id!)}>
			<button onClick={this.copyTicket.bind(this, ticket)}>Copy</button>
			{this.state.ticketHoverId === ticket.id ? <button onClick={this.onClickHideButton.bind(this, ticket.id)}>Hide</button> : null}
			<li key={ticket.id} className='ticket' onClick={this.onClickTicket.bind(this, ticket.id!)}>
				<h5 className='title'>{ticket.title}</h5>
				<footer>
					<div className='meta-data'>
						By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}
						<pre className='content'>{this.state.showContents[ticket.id!] === true ? ticket.content: null}</pre>
					</div>
				</footer>
			</li>
			</div> : null
			))}
			</InfiniteScroll>
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
		const {tickets, hiddenTickets} = this.state;

		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			<button onClick={this.showAll}>Restore</button>
			{tickets ? <div className='results'>Showing {tickets.length - Object.keys(hiddenTickets).length} results</div> : null }	
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;