import { CellChevronIcon } from "@/components/CellChevronIcon";
import { Page } from "@/components/Page";
import { useAuth } from "@/contexts/AuthContext";
import { on, postEvent, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { Avatar, ButtonCell, Cell, List, Section, Title } from "@telegram-apps/telegram-ui";
import { CircleCheck, CirclePlus } from "lucide-react";
import { FC, useEffect, useMemo } from "react";

export const ProfilePage: FC = () => {
  const { user, refreshUser } = useAuth();
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const tgUser = lp.tgWebAppData?.user;

  const phoneProvided = !!user?.phone;
  const phoneClick = () => postEvent('web_app_request_phone');

  const vkLinkClick = () => postEvent('web_app_open_popup', {
    title: 'Уведомление',
    message: 'Используйте команду /link в боте',
    buttons: [{
      id: 'ok',
      type: 'ok',
    }]
  });

  useEffect(() => {
    const removePhoneListener = on('phone_requested', _ => refreshUser());

    return () => removePhoneListener();
  }, []);

  return (
    <Page>
      <List>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.5rem 0.5rem 0',
        }}>
          <Avatar src={tgUser?.photo_url} size={96} />
          <Title style={{ marginTop: '0.6rem' }}>
            {user?.firstName || '–'} {user?.lastName || ''}
          </Title>
        </div>
      </List>
      <List>
        <Section header="Личная информация">
          <Cell readOnly description="Имя">
            {user?.firstName}
          </Cell>
          {user?.lastName && (
            <Cell readOnly description="Фамилия">
              {user.lastName}
            </Cell>
          )}
        </Section>
        <Section>
          <Cell readOnly description="Email">
            {user?.email ? user.email : 'Не указан'}
          </Cell>
          <Cell
            readOnly={phoneProvided}
            after={phoneProvided ? undefined : <CellChevronIcon />}
            onClick={() => {
              if(!phoneProvided) phoneClick();
            }}
            description="Номер телефона"
          >
            {user?.phone ? user.phone : 'Не указан'}
          </Cell>
        </Section>
        <Section>
          <>
            {user?.vkId && (
              <Cell
                before={<CircleCheck color="var(--sfx-green)" />}
              >
                Аккаунт VK привязан
              </Cell>
            )}
            {!user?.vkId && (
              <ButtonCell
                before={<CirclePlus />}
                onClick={() => vkLinkClick()}
              >
                Привязать аккаунт VK
              </ButtonCell>
            )}
          </>
        </Section>
      </List>
    </Page>
  );
};