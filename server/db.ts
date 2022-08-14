import {GetTicketsReponse, Ticket} from '../client/src/api';
import Knex from 'knex';
import * as uuid from "uuid";

export interface DbClient {
  getTickets: (page: number) => Promise<GetTicketsReponse>
  addTicket : (ticket: Ticket) => Promise<Ticket>
}

export const dbClient = (opts: {filePath: string}): DbClient => {
  const knex = Knex({
    client: 'sqlite3',
    connection: {
      filename: opts.filePath,
    },
  });
  knex.raw(`CREATE TABLE IF NOT EXISTS 'data' (
    id TEXT,
    title TEXT,
    content TEXT,
    userEmail TEXT,
    creationTime INTEGER,
    labels TEXT);`).then(() => void 0);

  async function getPostCount() {
      return knex('data').count('id as CNT').first()
  }

  return {
    async getTickets(page: number): Promise<GetTicketsReponse> {
      // If you are unfamiliar with knex, you can uncomment the next line and use raw sql
      // return knex.raw('select * from data limit 20');
      const cardinality =  await getPostCount()
      const tickets = await knex('data').select().offset((page - 1) * 20).limit(20);
      return {
        tickets,
        cardinality: Number(cardinality!["CNT"])
      }
    },
    async addTicket(ticket: Ticket): Promise<Ticket>{
      if(ticket.id === undefined)
      {
        ticket.id = uuid.v4();
      } 
            
      await knex('data').insert(ticket);
      return ticket;
    }
  }
}


