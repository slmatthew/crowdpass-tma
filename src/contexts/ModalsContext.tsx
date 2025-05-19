import { ModalController } from "@/components/modals/ModalController";
import { postEvent } from "@telegram-apps/sdk-react";
import React, { createContext, useContext, useState } from "react";

interface ModalState {
  id: string;
  entity?: any;
}

interface ModalContextValue {
  openModal: (modalId: string, entity?: any) => void;
  closeModal: () => void;
  modal: ModalState;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ id: '' });

  const openModal = (modalId: string, entity?: any) => {
    postEvent('web_app_expand');
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
    setModal({ id: modalId, entity });
  }

  const closeModal = () => {
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: true });
    setModal({ id: '' });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modal }}>
      {children}
      <ModalController />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if(!context) throw new Error('useModals must be used within ModalProvider');
  return context;
}