import { DuckedError } from "@/components/DuckedError";
import { EventDetails } from "@/components/EventDetails";
import { LoadingPage } from "@/components/LoadingPage";
import { Page } from "@/components/Page";
import { publicUrl } from "@/helpers/publicUrl";
import { useApiClient } from "@/hooks/useApiClient";
import { EventDetails as ApiEventDetails } from "@/types/api/EventDetails";
import { Event } from "@/types/models";
import { useQuery } from "@tanstack/react-query";
import { on, postEvent } from "@telegram-apps/sdk-react";
import { List } from "@telegram-apps/telegram-ui";
import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const EventPage: FC = () => {
  const { id } = useParams();
  const api = useApiClient();
  const navigate = useNavigate();

  const {
    data: event,
    isLoading,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<ApiEventDetails>(`events/${id}`).then(res => res.data),
    staleTime: 1000 * 60 * 3,
  });

  const buttonAvailable = event && event.ticketTypes.length > 0 && new Date(event.startDate!).getTime() - Date.now() > 0;

  useEffect(() => {
    if(buttonAvailable) {
      postEvent('web_app_setup_main_button', {
        is_visible: true,
        is_active: true,
        text: 'Купить билеты',
        has_shine_effect: true,
      });

      const removeMainButtonListener = on('main_button_pressed', _ => navigate(`/bookings/new/${event.id}`));

      return () => {
        console.log('remove')
        removeMainButtonListener();
        postEvent('web_app_setup_main_button', { is_visible: false });
      };
    }
  }, [buttonAvailable]);

  if(isLoading) return <LoadingPage />;

  if(!event) return <DuckedError
    description="Скорее всего, вы перешли по неправильной ссылке"
    header="Мероприятие не найдено"
    tgsUrl={publicUrl('/duck3.tgs')}
  />;

  return (
    <Page>
      <List>
        <EventDetails event={event as Event} />
        {!buttonAvailable && <div style={{ height: 'var(--sfx-modal-padding)' }} />}
      </List>
    </Page>
  );
};