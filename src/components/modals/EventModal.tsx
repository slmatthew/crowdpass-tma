import { Event } from "@/types/models";
import { List, Modal, ModalProps } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import { EventDetails } from "../EventDetails";

export const EventModal: FC<ModalProps & { event: Event & { prices?: { min: number, max: number } } }> = ({ event, ...props }) => (
  <Modal
    style={{ minHeight: '12rem' }}
    header={<Modal.Header>Мероприятие</Modal.Header>}
    {...props}
  >
    <List>
      <EventDetails event={event} />
      <div style={{ height: 'var(--sfx-modal-padding)' }} />
    </List>
  </Modal>
);