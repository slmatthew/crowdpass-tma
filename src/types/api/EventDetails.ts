import { TicketType, Event } from "../models";

export type EventDetailsTicketType = Partial<TicketType> & {
  id: number;
  name: string;
  price: number | string;
  available: number;
};

export type EventDetails = Partial<Event> & {
  ticketTypes: EventDetailsTicketType[];
};