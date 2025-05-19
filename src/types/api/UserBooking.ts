import { User, TicketStatus, TicketType, BookingStatus } from "../models";

export interface UserTicket {
  id: number;
  ticketTypeId: number;
  ownerFirstName?: string;
  ownerLastName?: string;
  status: TicketStatus;
  ticketType: TicketType;
  bookingTickets?: UserBookingTicket[];
}

export interface UserBookingTicket {
  id: number;
  bookingId: number;
  ticketId: number;
  booking?: UserBooking;
  ticket: UserTicket;
}

export interface UserBooking {
  id: number;
  userId: number;
  createdAt: Date;
  status: BookingStatus;
  user: User;
  bookingTickets: UserBookingTicket[];
}