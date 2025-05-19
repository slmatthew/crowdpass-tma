import { Event } from "../models";

export type DashboardResponse = {
  events: Event[],
  bookings: number,
  tickets: number,
};