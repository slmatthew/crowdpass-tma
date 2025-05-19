import { Page } from "@/components/Page";
import { useAuth } from "@/contexts/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { TicketValidateResponse } from "@/types/api/TicketValidateResponse";
import { Ticket } from "@/types/models";
import { on, postEvent } from "@telegram-apps/sdk-react";
import { Button, ButtonCell, Cell, List, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { AxiosError } from "axios";
import { ShieldCheck, TicketCheck, TicketX, TriangleAlert } from "lucide-react";
import React, { FC, useEffect, useState } from "react";

const getDisplayStatus = (status: Ticket['status']): string => {
  switch(status) {
    case 'AVAILABLE': return 'Доступен';
    case 'RESERVED': return 'Забронирован';
    case 'SOLD': return 'Продан';
    case 'USED': return 'Использован';
    default: return 'Неизвестно';
  }
};

export const QRCheckerPage: FC = () => {
  const api = useApiClient();
  const { user } = useAuth();

  if(!user || !user.admin) return (
    <Page>
      <Placeholder
        description="Увы"
        header="Здесь ничего нет"
      >
        <img
          alt="Telegram sticker"
          className="blt0jZBzpxuR4oDhJc8s"
          src="https://xelene.me/telegram.gif"
          style={{ maxWidth: '12rem', maxHeight: '12rem', aspectRatio: '1 / 1' }}
        />
      </Placeholder>
    </Page>
  );

  const [canOpenScaner, setCanOpenScaner] = useState<boolean>(true);
  const [isScanerOpened, setIsScanerOpened] = useState<boolean>(false);

  const [validateResult, setValidateResult] = useState<TicketValidateResponse | null>(null);
  const [validateError, setValidateError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const removeQrClosedListener = on('scan_qr_popup_closed', (_) => {
      setIsScanerOpened(false);
      setCanOpenScaner(true);
    });
    const removeQrReceivedListener = on('qr_text_received', (payload) => {
      const { data } = payload;
      validateTicket(data);
    });

    return () => {
      removeQrClosedListener();
      removeQrReceivedListener();
    };
  }, []);

  const openScaner = () => {
    if(canOpenScaner && !isScanerOpened) {
      setCanOpenScaner(false);
      setIsScanerOpened(true);
      postEvent('web_app_open_scan_qr_popup', { text: 'Отсканируйте QR-код билета' });
    }
  };

  async function validateTicket(secret: string, makeUsed: boolean = false) {
    setValidateError(null);
    setValidateResult(null);

    try {
      const result = (await api.post<TicketValidateResponse>('admin/dashboard/validate-ticket', {
        secret,
        makeUsed: makeUsed ? '1' : '0',
      })).data;

      setValidateResult(makeUsed ? null : result);
    } catch(err: any) {
      console.error(err);
      if(err instanceof AxiosError) {
        if(err.response) {
          setValidateError(err.response.data);
        }
      }
    } finally {
      postEvent('web_app_close_scan_qr_popup');
      setIsScanerOpened(false);
      setCanOpenScaner(true);
    }
  }

  return (
    <Page>
      <List>
        {validateError && (
          <Section>
            <Cell before={<TriangleAlert color="var(--sfx-orange)" />}>
              {validateError.message}
            </Cell>
          </Section>
        )}
        {validateResult && (
          <React.Fragment key="0.5">
            <Section header={`Билет №${validateResult.event.id}-${validateResult.ticketId}`}>
              <Cell description="Мероприятие" multiline>
                {validateResult.event.name}
              </Cell>
              <Cell description="Категория билета">
                {validateResult.ticketType.name}
              </Cell>
              <Cell description="Стоимость билета">
                {validateResult.ticketType.price} ₽
              </Cell>
            </Section>
            <Section>
              <Cell
                before={validateResult.allowed ? <TicketCheck color="var(--sfx-green)" /> : <TicketX color="var(--sfx-red)" />}
                description={getDisplayStatus(validateResult.status)}
              >
                {validateResult.allowed ? 'Разрешен' : 'Запрещен'}
              </Cell>
            </Section>
            {validateResult.allowed && (
              <Section>
                <ButtonCell before={<ShieldCheck />} onClick={() => validateTicket(validateResult.secret, true)}>
                  Подтвердить проход
                </ButtonCell>  
              </Section>
            )}
          </React.Fragment>
        )}

        <Button onClick={() => openScaner()} disabled={!canOpenScaner} stretched>Открыть сканер</Button>
      </List>
    </Page>
  );
};