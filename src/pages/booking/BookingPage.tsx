import React, { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { Page } from "@/components/Page";
import { Button, Cell, List, Section, Title, Text } from "@telegram-apps/telegram-ui";
import { EventDetails, EventDetailsTicketType } from "@/types/api/EventDetails";
import { SimpleCounter } from "@/components/SimpleCounter";
import { useParams } from "react-router-dom";
import { useApiClient } from "@/hooks/useApiClient";
import { LoadingPage } from "@/components/LoadingPage";

export const BookingPage: FC = () => {
  const { eventId } = useParams();
  const api = useApiClient();

  const {
    data: cachedEvent,
    isLoading,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.get<EventDetails>(`events/${eventId}`).then(res => res.data),
    staleTime: 1000 * 60 * 3,
  });

  const { addItem, items } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  if(isLoading) return <LoadingPage />;

  if(!cachedEvent) return (
    <Page>
      <Title>Мероприятие не найдено</Title>
    </Page>
  );

  const handleQuantityChange = (ticketTypeId: number, value: number) => {
    setQuantities((prev) => {
      if(prev[ticketTypeId] !== value) {
        return { ...prev, [ticketTypeId]: value };
      }

      return prev;
    });
  };

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([ticketTypeIdStr, quantity]) => {
      const ticketTypeId = Number(ticketTypeIdStr);
      const ticketType = cachedEvent.ticketTypes.find(t => t.id === ticketTypeId);
      if (ticketType && quantity > 0) {
        addItem({
          event: { id: cachedEvent.id!, name: cachedEvent.name! },
          ticketTypeId: ticketType.id,
          ticketTypeName: ticketType.name,
          price: Number(ticketType.price),
          quantity,
        });
        quantities[ticketType.id] -= quantity;
        quantities[ticketType.id] = Math.min(quantities[ticketType.id], 0);
      }
    });
  };

  return (
    <Page>
      <div style={{ height: '1rem' }} />

      <Title style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{cachedEvent.name}</Title>
      <Section>
        <Cell multiline>
          {cachedEvent.description}
        </Cell>
        <Cell multiline>
          {cachedEvent.location}
        </Cell>
      </Section>

      {cachedEvent.ticketTypes.length === 0 && (
        <Text style={{ display: 'flex', justifyContent: 'center', marginTop: '.5rem' }}>Нет доступных типов билетов</Text>
      )}

      {cachedEvent.ticketTypes.length > 0 && (
        <React.Fragment key="0.5">
          <List>
            {(cachedEvent.ticketTypes as EventDetails['ticketTypes']).map((type: EventDetailsTicketType) => {
              const cartItem = items.find(ci => ci.ticketTypeId === type.id);
              const description = cartItem ? `${cartItem.quantity} шт. в корзине` : undefined;

              return (
                <Cell
                  key={type.id}
                  subtitle={`Цена: ${type.price} ₽, доступно: ${type.available}`}
                  description={description}
                  after={
                    <SimpleCounter
                      value={quantities[type.id] || 0}
                      onChange={(value) => handleQuantityChange(type.id, value)}
                      min={0}
                      max={type.available}
                    />
                  }
                >
                  {type.name}
                </Cell>
              )
            })}
          </List>

          <Section>
            <Button stretched onClick={handleAddToCart}>
              Добавить в корзину
            </Button>
          </Section>
        </React.Fragment>
      )}
    </Page>
  );
};