import { Booking, Ticket, TicketType, Event } from "../models";

export type MyTicketsResponse = {
  tickets: (Omit<Ticket, 'ticketType'> & { bookingId: number })[],
  ticketTypes: Omit<TicketType, 'event' | 'quantity'>[],
  bookings: Omit<Booking, 'user' | 'bookingTickets'>[],
  events: Omit<Event, 'organizer' | 'category' | 'subcategory' | 'ticketTypes'>[],
};