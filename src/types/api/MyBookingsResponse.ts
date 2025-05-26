import { BookingStatus, TicketStatus } from "../models";

export type MyBookingsResponse = {
  bookings: {
    id: number;
    createdAt: Date;
    status: BookingStatus;
    tickets: {
      id: number;
      ticketTypeId: number;
      qrCodeSecret: string | null;
      ownerFirstName: string | null;
      ownerLastName: string | null;
      status: TicketStatus;
    }[];
  }[];
  ticketTypes: {
    id: number;
    eventId: number;
    slug: string | null;
    name: string;
    price: number;
  }[];
  events: {
    id: number;
    slug: string | null;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    posterUrl: string | null;
  }[];
};