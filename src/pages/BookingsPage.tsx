import { DuckedError } from "@/components/DuckedError";
import { Link } from "@/components/Link/Link";
import { LoadingPage } from "@/components/LoadingPage";
import { Page } from "@/components/Page";
import { useModals } from "@/contexts/ModalsContext";
import { publicUrl } from "@/helpers/publicUrl";
import { useApiClient } from "@/hooks/useApiClient";
import { UserBooking } from "@/types/api/UserBooking";
import { TicketType } from "@/types/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { on, postEvent } from "@telegram-apps/sdk-react";
import { Section, Cell, List, Title, Badge, ButtonCell } from "@telegram-apps/telegram-ui";
import { AxiosError } from "axios";
import { Ban, CreditCard } from "lucide-react";
import { FC, useEffect } from "react";

export const BookingsPage: FC = () => {
  const api = useApiClient();
  const { openModal } = useModals();

  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get<UserBooking[]>('bookings/').then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const removePopupListener = on('popup_closed', async (payload) => {
      const { button_id } = payload;
      if(!button_id) return;

      const match = /^booking-cancel-confirm-(\d+)$/g.exec(button_id);
      if(!match) return;

      const bookingId = Number(match[1]);
      try {
        await api.delete(`bookings/${bookingId}`);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } catch(err) {
        console.error(err);

        postEvent('web_app_open_popup', {
          title: 'Произошла ошибка',
          message: `При отмене бронирования №${bookingId} произошла ошибка. Попробуйте позже`,
          buttons: [{
            id: 'ok',
            type: 'ok',
          }]
        });
      }
    });

    const removeInvoiceListener = on('invoice_closed', (payload) => {
      const status: Record<string, string> = {
        'paid': 'Бронирование успешно оплачено',
        'failed': 'Не удалось совершить оплату',
        'pending': 'Платёж в обработке',
        'cancelled': 'Платёж отменён',
      };
      const index: string = payload.status ?? '';

      const message = status[index] ?? 'Не удалось получить информацию о результате платежа';

      refetch();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });

      postEvent('web_app_open_popup', {
        title: 'Уведомление',
        message,
        buttons: [{
          id: 'ok',
          type: 'ok',
        }]
      });
    });

    return () => {
      removePopupListener();
      removeInvoiceListener();
    };
  }, []);

  if(isLoading) return <LoadingPage />;

  if(!isLoading && bookings?.length === 0) return <DuckedError
    description={<span>Давайте скорее <Link to="/events">исправим это</Link>!</span>}
    header="Бронирований нет"
    tgsUrl={publicUrl('/duck1.tgs')}
  />;

  const handleCancel = (bookingId: number) => {
    postEvent('web_app_open_popup', {
      title: 'Вы уверены?',
      message: `Вы действительно хотите отменить бронирование №${bookingId}?`,
      buttons: [{
        id: `booking-cancel-confirm-${bookingId}`,
        type: 'destructive',
        text: 'Удалить',
      }, {
        id: 'booking-cancel-cancel',
        type: 'cancel',
      }]
    });
  };

  const handlePay = async (bookingId: number) => {
    try {
      const link = (await api.get<{ link: string }>(`bookings/${bookingId}/telegram-invoice`)).data.link;
      const slug = link.replace('https://t.me/$', '');

      postEvent('web_app_open_invoice', { slug });
    } catch(err: any) {
      console.error(err);
      if(err instanceof AxiosError) {
        const message = err.response?.data.message ?? 'Произошла ошибка'
        postEvent('web_app_open_popup', {
          title: 'Уведомление',
          message,
          buttons: [{
            id: 'ok',
            type: 'ok'
          }]
        });
      }
    }
  };
  
  return (
    <Page>
      <List>
        <section style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Title weight="2" onClick={() => refetch()}>Мои бронирования</Title>
        </section>
        {bookings?.map((booking) => {
          const ticketsMap = new Map<number, { type: TicketType, count: number }>();
          booking.bookingTickets.forEach((bTicket) => {
            if(!ticketsMap.has(bTicket.ticket.ticketTypeId)) {
              ticketsMap.set(bTicket.ticket.ticketTypeId, { type: bTicket.ticket.ticketType, count: 0 });
            }

            const ticketEntry = ticketsMap.get(bTicket.ticket.ticketTypeId)!;
            ticketEntry.count += 1;
          });

          const tickets = Array.from(ticketsMap).map(ticket => ({ type: ticket[1].type, count: ticket[1].count }));

          return (
            <Section key={booking.id} header={`Бронирование №${booking.id}`}>
              {tickets.map((ticket, idx) => (
                <Cell
                  key={idx}
                  subhead={ticket.type.event!.name}
                  description={ticket.type.event!.description}
                  after={<Badge type="number" mode="gray">{ticket.type.price * ticket.count}</Badge>}
                  onClick={() => openModal('event', ticket.type.event!)}
                >
                  {ticket.type.name} <span style={{ color: 'var(--tg-theme-subtitle-text-color)' }}>× {ticket.count}</span>
                </Cell>
              ))}
              <ButtonCell onClick={() => handlePay(booking.id)} before={<CreditCard />}>
                Оплатить бронирование
              </ButtonCell>
              <ButtonCell onClick={() => handleCancel(booking.id)} before={<Ban />} mode="destructive">
                Отменить бронирование
              </ButtonCell>
            </Section>
          );
        })}
      </List>
    </Page>
  );
};