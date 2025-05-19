import { DuckedError } from "@/components/DuckedError";
import { Link } from "@/components/Link/Link";
import { LoadingPage } from "@/components/LoadingPage";
import { Page } from "@/components/Page";
import { useModals } from "@/contexts/ModalsContext";
import { publicUrl } from "@/helpers/publicUrl";
import { useApiClient } from "@/hooks/useApiClient";
import { MyTicketsResponse } from "@/types/api/MyTicketsResponse";
import { useQuery } from "@tanstack/react-query";
import { Cell, List, Section, Title } from "@telegram-apps/telegram-ui";
import { Badge, BadgeCheck, Flame } from "lucide-react";
import { FC } from "react";

export const TicketsPage: FC = () => {
  const api = useApiClient();
  const { openModal } = useModals();
  const {
    data: ticketsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => api.get<MyTicketsResponse>('tickets/my').then(res => res.data),
    staleTime: 1000 * 60 * 2,
  });

  if(isLoading) return <LoadingPage />;

  const fullTickets = ticketsData?.tickets.map((ticket) => {
    const ticketType = ticketsData.ticketTypes.find(tt => tt.id === ticket.ticketTypeId);
    const event = ticketsData.events.find(e => e.id === ticketType?.eventId);

    const soon = event?.startDate
      ? new Date(event.startDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
      : false;
    
    return {
      ...ticket,
      soon,
      ticketType,
      event,
    };
  });

  if(!ticketsData || !fullTickets || fullTickets.length === 0) return <DuckedError
    description={<span>Давайте скорее <Link to="/bookings">исправим это</Link>!</span>}
    header="Билетов нет"
    tgsUrl={publicUrl('/duck1.tgs')}
  />;

  return (
    <Page>
      <List>
        <section style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Title weight="2" onClick={() => refetch()}>Мои билеты</Title>
        </section>
        {ticketsData.bookings.map((booking, idx) => (
          <Section key={idx} header={`Бронирование №B${booking.id}`}>
            {fullTickets!.filter(({ bookingId }) => booking.id === bookingId).map((ticket, tidx) => {
              if(!ticket.event || !ticket.ticketType) return;

              return (
                <Cell
                  key={tidx}
                  before={ticket.status === 'SOLD' ? <Badge color="var(--sfx-orange" /> : <BadgeCheck color="var(--sfx-green" />}
                  subhead={ticket.event.name}
                  subtitle={`${ticket.event.id}-${ticket.id}`}
                  after={ticket.soon ? <Flame style={{ color: 'var(--sfx-orange)' }} /> : null}
                  onClick={() => openModal('ticket', { ...ticket, booking, boughtDate: booking.createdAt })}
                >
                  {ticket.ticketType.name}
                </Cell>
              );
            })}
          </Section>
        ))}
      </List>
    </Page>
  );
};