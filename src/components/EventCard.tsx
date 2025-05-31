import type { FC } from 'react';
import { CardProps, Card } from '@telegram-apps/telegram-ui';
import React from 'react';
import { Event } from '@/types/models';
import dayjs from 'dayjs';
import { appConfig } from '@/config/appConfig';
import { useNavigate } from 'react-router-dom';

export const MockedEventForSkeleton: Event = {
  id: 0,
  name: 'Salo Matuchak Event',
  description: 'Really good event for all people',
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  location: 'Somewhere',
  posterUrl: '',
  organizerId: 0,
  categoryId: 0,
  subcategoryId: 0,
  isSalesEnabled: false,
};

export type EventCardProps = CardProps & {
  event: Event;
};

export const EventCard: FC<EventCardProps> = ({ event, ...rest }) => {
  const navigate = useNavigate();

  return (
    <Card {...rest}  style={{
      width: '100%',
      maxWidth: '400px',
      minWidth: '240px',
      flexShrink: 0,
    }} onClick={() => navigate(`/events/${event.id}`)} type='ambient'>
      <React.Fragment key=".0">
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '100%',
            margin: '0 auto',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
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
            }}
          />
        </div>
        <Card.Cell
          readOnly
          multiline={false}
          subtitle={dayjs(event.startDate).format('DD.MM.YYYY')}
          style={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {event.name}
        </Card.Cell>
      </React.Fragment>
    </Card>
  );
}