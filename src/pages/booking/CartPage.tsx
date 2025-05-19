import { useCart } from "@/contexts/CartContext";
import { Page } from "@/components/Page";
import { Button, ButtonCell, Cell, List, Section, Text, Title } from "@telegram-apps/telegram-ui";
import { FC, useEffect } from "react";
import { ListCheck } from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";
import { useQueryClient } from "@tanstack/react-query";
import { DuckedError } from "@/components/DuckedError";
import { Link } from "@/components/Link/Link";
import { publicUrl } from "@/helpers/publicUrl";

export const CartPage: FC = () => {
  const api = useApiClient();
  const { items, removeItem, clearCart, setShowButton } = useCart();
  const queryClient = useQueryClient();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
   try {
      await api.post('bookings/', {
        tickets: items.map((i) => ({
          ticketTypeId: i.ticketTypeId,
          quantity: i.quantity,
        })),
      });

      clearCart();

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });

      alert("Бронирование успешно оформлено!");
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при бронировании.");
    }
  };

  useEffect(() => {
    setShowButton(true);
    return () => setShowButton(false);
  }, []);

  if (items.length === 0) return <DuckedError
    description={<span>Предлагаем посмотреть на <Link to="/events">мероприятия</Link></span>}
    header="Корзина пуста"
    tgsUrl={publicUrl('/duck1.tgs')}
  />;

  return (
    <Page>
      <List>
        <Title>Ваша корзина</Title>
        <Section>
          {items.map((item) => (
            <Cell
              key={item.ticketTypeId}
              subhead={item.event.name}
              subtitle={`x${item.quantity} • ${item.price} ₽ за шт.`}
              after={<Button size="s" mode="plain" onClick={() => removeItem(item.ticketTypeId)}>Удалить</Button>}
            >
              {item.ticketTypeName}
            </Cell>
          ))}
        </Section>
        <Section>
          <Cell after={<Text>{total} ₽</Text>}>Итого</Cell>
        </Section>
        <Section>
          <ButtonCell before={<ListCheck />} onClick={handleCheckout}>
            Оформить бронирование
          </ButtonCell>
        </Section>
      </List>
    </Page>
  );
};