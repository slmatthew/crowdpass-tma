import { Section, List, Skeleton, Avatar, Title, Text, Button, Spinner, Caption } from '@telegram-apps/telegram-ui';
import { useMemo, type FC } from 'react';

import { Page } from '@/components/Page.tsx';

import { useAuth } from '@/contexts/AuthContext';
import { postEvent, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { CircleUserRound, CreditCard, MessageCircleMore, ShoppingCart, Tickets } from 'lucide-react';
import { IconCell } from '@/components/IconCell';
import { CellChevronIcon } from '@/components/CellChevronIcon';
import { useApiClient } from '@/hooks/useApiClient';
import { useQuery } from '@tanstack/react-query';
import { Carousel } from '@/components/Carousel/Carousel';
import { EventCard } from '@/components/EventCard';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { DashboardResponse } from '@/types/api/DashboardResponse';

export const DashboardPage: FC = () => {
  const api = useApiClient();
  const { user } = useAuth();
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const navigate = useNavigate();
  const { items } = useCart();

  const tgUser = lp.tgWebAppData?.user;

  const {
    data: dashboard,
    isLoading
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardResponse>('dashboard/').then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const openHelp = () => postEvent('web_app_open_tg_link', { path_full: '/CrowdPassNews' });

  useSettingsButton();

  return (
    <Page back={false}>
      <List>
        <section style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.5rem',
          }}>
            <Avatar src={tgUser?.photo_url} size={96} />
            <Title style={{ marginTop: '0.6rem' }}>
              {user?.firstName || '–'} {user?.lastName || ''}
            </Title>
          </div>
        </section>
        <Section>
          <IconCell onClick={() => navigate('/profile')} after={<CellChevronIcon />} icon={<CircleUserRound />} color="var(--sfx-red)">Личные данные</IconCell>
        </Section>
        <Section>
          {items.length > 0 && (<IconCell onClick={() => navigate('/bookings/cart')} after={<CellChevronIcon />} icon={<ShoppingCart />} color="var(--sfx-green)">Корзина</IconCell>)}
          <IconCell onClick={() => navigate('/bookings')} hint={dashboard?.bookings === 0 ? undefined : dashboard?.bookings} after={<CellChevronIcon />} icon={<CreditCard />} color="var(--sfx-pink)">Мои бронирования</IconCell>
          <IconCell onClick={() => navigate('/tickets')} hint={dashboard?.tickets === 0 ? undefined : dashboard?.tickets} after={<CellChevronIcon />} icon={<Tickets />} color="var(--sfx-blue)">Мои билеты</IconCell>
        </Section>
        <Section>
          <IconCell onClick={() => openHelp()} after={<CellChevronIcon />} icon={<MessageCircleMore />} color="var(--sfx-orange)">Помощь</IconCell>
        </Section>
        <div style={{ padding: '.5rem' }}>
          <Title weight='2' style={{ marginBottom: '0.5rem' }}>Популярное</Title>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Spinner size="s" />
            </div>
          )}
          {!isLoading && dashboard && dashboard.events && (
            <Carousel gap={16}>
              {dashboard.events.map((event, idx) => (
                <EventCard key={idx} event={event} />
              ))}
            </Carousel>
          )}
          {!isLoading && (!dashboard || !dashboard.events || dashboard.events.length === 0) && (
            <Text style={{ textAlign: 'center' }}>Нет популярных мероприятий</Text>
          )}
          <Skeleton visible={isLoading}>
            <Button onClick={() => navigate('/events')} size="m" mode="bezeled" stretched>Показать все</Button>
          </Skeleton>
        </div>
        <Caption style={{ display: 'flex', justifyContent: 'center', color: 'var(--tgui--hint_color)' }}>v{__APP_VERSION__ ?? '0'}</Caption>
      </List>
    </Page>
  );
};