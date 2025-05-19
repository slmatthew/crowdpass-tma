import { IdNamePair } from "./IdNamePair";
import { Event } from "../models";

export type EventsResponse = {
  events: (Event & { prices: { min: number | null, max: number | null } })[];
  totalCount: number;
  organizers: IdNamePair[];
  categories: IdNamePair[];
  subcategories: (IdNamePair & { categoryId: number })[];
};