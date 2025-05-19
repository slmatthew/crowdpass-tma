import type { ComponentType, JSX } from 'react';

import { DashboardPage } from '@/pages/DashboardPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { TicketsPage } from '@/pages/TicketsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { EventsPage } from '@/pages/EventsPage';
import { QRCheckerPage } from '@/pages/admin/QRCheckerPage';
import { EventPage } from '@/pages/EventPage';
import { BookingPage } from '@/pages/booking/BookingPage';
import { CartPage } from '@/pages/booking/CartPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: DashboardPage },
  { path: '/profile', Component: ProfilePage },
  { path: '/tickets', Component: TicketsPage },

  { path: '/bookings/cart', Component: CartPage },
  { path: '/bookings', Component: BookingsPage },
  { path: '/bookings/new/:eventId', Component: BookingPage },

  { path: '/events', Component: EventsPage },
  { path: '/events/:id', Component: EventPage },

  { path: '/sfx/qr', Component: QRCheckerPage },
];
