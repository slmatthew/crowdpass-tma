import { appConfig } from "@/config/appConfig";
import { Event } from "@/types/models";
import { themeParamsButtonColor, themeParamsHintColor } from "@telegram-apps/sdk-react";
import { Section, Title, Cell } from "@telegram-apps/telegram-ui";
import dayjs from "dayjs";
import { MapPin, Calendar, CalendarCheck } from "lucide-react";
import React, { FC } from "react";

const Icon: FC<{ children: React.ReactNode }> = ({ children }) => {
  const accentColor = themeParamsButtonColor() || '#2AABEE';
  const secondaryColor = themeParamsHintColor() || accentColor;

  return <span style={{ color: secondaryColor }}>{children}</span>;
};

export type EventDetailsProps = {
  event: Event;
  children?: React.ReactNode | React.ReactNode[];
  childrenPosition?: 'afterMain' | 'afterSecondary';
};

export const EventDetails: FC<EventDetailsProps> = ({ event, children, childrenPosition = 'afterMain' }) => {
  const humanizedDate = (date: Date | string) => {
    const today = dayjs(Date.now()).format('DD.MM.YYYY');
    const dateDay = dayjs(date).format('DD.MM.YYYY');

    return today === dateDay ? dayjs(date).format('Сегодня в HH:mm') : dayjs(date).format('DD.MM.YYYY в HH:mm');
  };

  return (
    <React.Fragment key="0.5">
      <section style={{ padding: '0 .5rem' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            marginRight: '1rem',
          }}
        >
          <img
            alt={event.name}
            src={event.posterUrl || appConfig.placeholderSrc}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '5%'
            }}
          />
        </div>
      </section>
      <Title style={{ paddingTop: '.5rem', textAlign: 'center' }} weight="2">{event.name}</Title>
      <Section>
        <Cell
          multiline={true}
        >
          {event.description}
        </Cell>
        <>
          {event.organizer && (
            <Cell description="Организатор">
              {event.organizer.name}
            </Cell>
          )}
          {event.category && (
            <Cell description="Категория">
              {event.category.name}
            </Cell>
          )}
          {event.subcategory && (
            <Cell description="Подкатегория">
              {event.subcategory.name}
            </Cell>
          )}
        </>
      </Section>
      {childrenPosition === 'afterMain' && children}
      <Section>
        <Cell
          multiline={true}
          before={<Icon><MapPin /></Icon>}
          description="Место проведения"
        >
          {event.location}
        </Cell>
        <Cell
          multiline={true}
          before={<Icon><Calendar /></Icon>}
          description="Дата и время начала"
        >
          {humanizedDate(event.startDate)}
        </Cell>
        <Cell
          multiline={true}
          before={<Icon><CalendarCheck /></Icon>}
          description="Дата и время окончания"
        >
          {humanizedDate(event.endDate)}
        </Cell>
      </Section>
      {childrenPosition === 'afterSecondary' && children}
    </React.Fragment>
  );
}