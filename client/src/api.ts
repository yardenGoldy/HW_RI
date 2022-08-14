import axios from 'axios';
import {APIRootPath} from '@fed-exam/config';

export type Ticket = {
    id?: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];
}

export type GetTicketsReponse = {
    tickets: Array<Ticket>
    cardinality: number
}

export type ApiClient = {
    getTickets: (page?:number) => Promise<GetTicketsReponse>;
    addTicket: (ticket: Ticket) => Promise<Ticket>;
}

export const createApiClient = (): ApiClient => {
    return {
        getTickets: (page:number = 1) => {
            return axios.get(`${APIRootPath}?page=${page}`).then((res) => res.data);
        },
        addTicket: (ticket: Ticket) => {
            return axios.post(APIRootPath + "/add", ticket).then((res) => res.data);
        }
    }
}
