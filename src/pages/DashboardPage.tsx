import { Section, List, Skeleton, Avatar, Title, Button, Caption, Cell } from '@telegram-apps/telegram-ui';
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
import { EventCard, MockedEventForSkeleton } from '@/components/EventCard';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useSettingsButton } from '@/hooks/useSettingsButton';
import { DashboardResponse } from '@/types/api/DashboardResponse';
import { useBridge } from '@/contexts/BridgeContext';
import { DuckedError } from '@/components/DuckedError';
import { publicUrl } from '@/helpers/publicUrl';

export const DashboardPage: FC = () => {
  const api = useApiClient();
  const { user } = useAuth();
  const { reloadIframe } = useBridge();
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const navigate = useNavigate();
  const { items } = useCart();

  const tgUser = lp.tgWebAppData?.user;
  const userLoaded = !!user;

  const {
    data: dashboard,
    isLoading
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardResponse>('dashboard/').then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const showEvents = dashboard && dashboard.events && dashboard.events.length > 0 && userLoaded;

  const openHelp = () => postEvent('web_app_open_tg_link', { path_full: '/CrowdPassNews' });

  useSettingsButton();

  if(!isLoading && !userLoaded) return <DuckedError
    pageBack={false}
    description="Нам не удалось получить нужную для работы информацию"
    header="Что-то пошло не так"
    tgsUrl={publicUrl('/duck3.tgs')}
    action={<Button onClick={() => reloadIframe()}>Перезагрузить приложение</Button>}
  />

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
              {user?.firstName || tgUser?.first_name || '–'} {user?.lastName || tgUser?.last_name || ''}
            </Title>
          </div>
        </section>
        <Section>
          <IconCell disabled={!userLoaded} onClick={() => navigate('/profile')} after={<CellChevronIcon />} icon={<CircleUserRound />} color="var(--sfx-red)">Личные данные</IconCell>
        </Section>
        <Section>
          {items.length > 0 && (<IconCell onClick={() => navigate('/bookings/cart')} after={<CellChevronIcon />} icon={<ShoppingCart />} color="var(--sfx-green)">Корзина</IconCell>)}
          <IconCell disabled={!userLoaded} onClick={() => navigate('/bookings')} hint={dashboard?.bookings === 0 ? undefined : dashboard?.bookings} after={<CellChevronIcon />} icon={<CreditCard />} color="var(--sfx-pink)">Мои бронирования</IconCell>
          <IconCell disabled={!userLoaded} onClick={() => navigate('/tickets')} hint={dashboard?.tickets === 0 ? undefined : dashboard?.tickets} after={<CellChevronIcon />} icon={<Tickets />} color="var(--sfx-blue)">Мои билеты</IconCell>
        </Section>
        <Section>
          <IconCell disabled={!userLoaded} onClick={() => openHelp()} after={<CellChevronIcon />} icon={<MessageCircleMore />} color="var(--sfx-orange)">Помощь</IconCell>
        </Section>
        <div style={{ padding: '.5rem' }}>
          <Skeleton visible={isLoading}>
            <Title weight='2' style={{ marginBottom: '0.5rem' }}>Популярное</Title>
            {isLoading && (
              <Carousel>
                <EventCard event={MockedEventForSkeleton} />
              </Carousel>
            )}
            {!isLoading && showEvents && (
              <>
                <Carousel gap={16}>
                  {dashboard!.events.map((event, idx) => (
                    <EventCard key={idx} event={event} />
                  ))}
                </Carousel>
                <Button onClick={() => navigate('/events')} size="m" mode="bezeled" stretched>Показать все</Button>
              </>
            )}
            {!isLoading && !showEvents && (
              <Section style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <Cell multiline>
                  К сожалению, в данный момент нет доступных мероприятий
                </Cell>
              </Section>
            )}
          </Skeleton>
        </div>
        <Caption style={{ display: 'flex', justifyContent: 'center', color: 'var(--tgui--hint_color)' }}>v{__APP_VERSION__ ?? '0'}</Caption>
      </List>
    </Page>
  );
};