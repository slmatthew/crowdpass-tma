import { IdNamePair } from "./IdNamePair";

export type EventsResponse = {
  events: {
    id: number;
    slug: string | null;
    name: string;
    description: string;
    startDate: Date;
    location: string;
    posterUrl: string | null;
    organizerId: number;
    categoryId: number;
    subcategoryId: number;
    prices: {
      min: number;
      max: number;
    };
  }[];
  totalCount: number;
  organizers: { id: number; name: string; slug: string | null; }[];
  categories: IdNamePair[];
  subcategories: (IdNamePair & { categoryId: number })[];
};