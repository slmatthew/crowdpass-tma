import { Ticket } from "@/types/models";
import { Cell, List, Modal, ModalProps, Section, Title } from "@telegram-apps/telegram-ui";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import { FC } from "react";

type ModalTicket = Ticket & {
  booking?: {
    id: number;
  },
  event?: {
    id: number;
    name: string;
  },
  price?: number;
  boughtDate?: string;
};

const getDisplayStatus = (status: Ticket['status']): string => {
  switch(status) {
    case 'AVAILABLE': return 'Доступен';
    case 'RESERVED': return 'Забронирован';
    case 'SOLD': return 'Продан';
    case 'USED': return 'Использован';
    default: return 'Неизвестно';
  }
};

export const TicketModal: FC<ModalProps & { ticket: ModalTicket }> = ({ ticket, ...props }) => (
  <Modal
    {...props}
    header={<Modal.Header>Просмотр билета</Modal.Header>}
  >
    <List>
      <section style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          {ticket.qrCodeSecret && (
            <div style={{
              padding: '.5rem',
              background: 'var(--tg-background-color)'
            }}>
              <QRCodeSVG value={ticket.qrCodeSecret} />
            </div>
          )}
        </div>
      </section>
      <Title style={{ paddingTop: '.5rem', textAlign: 'center' }} weight="2">Билет №{ticket.event ? `${ticket.event.id}-${ticket.id}` : ticket.id}</Title>
      <Section>
        <Cell readOnly multiline={true} style={{ textAlign: 'center' }}>
          Это ваш билет на {ticket.event ? `мероприятие «${ticket.event.name}»` : 'мероприятие'}.
          {ticket.status === 'SOLD' && (
            <><br /><br />Покажите его на входе, чтобы пройти</>
          )}
        </Cell>
      </Section>
      <Section header={ticket.booking ? `Бронирование №B${ticket.booking.id}` : null}>
        <>
          {ticket.status && (
            <Cell readOnly description="Статус">
              {getDisplayStatus(ticket.status)}
            </Cell>
          )}
          {ticket.ticketType && (
            <Cell readOnly description="Категория">
              {ticket.ticketType.name}
            </Cell>
          )}
          {ticket.boughtDate && (
            <Cell readOnly description="Дата покупки">
              {dayjs(new Date(ticket.boughtDate)).format('DD.MM.YYYY в HH:mm:ss')}
            </Cell>
          )}
        </>
      </Section>
      <div style={{ height: 'var(--sfx-modal-padding)' }} />
    </List>
  </Modal>
);