import { useModals } from "@/contexts/ModalsContext";
import { EventModal } from "./EventModal";
import { TicketModal } from "./TicketModal";

export function ModalController() {
  const { modal, closeModal } = useModals();

  return (
    <>
      {modal.id === 'event' && (
        <EventModal event={modal.entity} onOpenChange={(open) => open ? null : closeModal()} open={modal.id === 'event'} />
      )}
      {modal.id === 'ticket' && (
        <TicketModal ticket={modal.entity} onOpenChange={(open) => open ? null : closeModal()} open={modal.id === 'ticket'} />
      )}
    </>
  );
}