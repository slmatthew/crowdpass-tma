import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItem } from "@/types/cart";
import { on, postEvent } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router-dom";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (ticketTypeId: number) => void;
  clearCart: () => void;
  updateQuantity: (ticketTypeId: number, quantity: number) => void;
  setShowButton: (status: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showButton, setShowButton] = useState<boolean>(false);
  const navigate = useNavigate();

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.ticketTypeId === item.ticketTypeId);
      if (existing) {
        return prev.map((i) =>
          i.ticketTypeId === item.ticketTypeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (ticketTypeId: number) => {
    setItems((prev) => prev.filter((i) => i.ticketTypeId !== ticketTypeId));
  };

  const clearCart = () => setItems([]);

  const updateQuantity = (ticketTypeId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i
      )
    );
  };

  useEffect(() => {
    if(items.length > 0) {
      postEvent('web_app_setup_closing_behavior', { need_confirmation: true });
      
      if(!showButton) {
        postEvent('web_app_setup_secondary_button', {
          is_visible: true,
          is_active: true,
          text: 'Перейти в корзину',
          position: 'bottom',
        });
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });

        const removeSecondaryButtonListener = on('secondary_button_pressed', _ => {
          navigate('/');
          navigate('/bookings/cart');
        });

        return () => {
          removeSecondaryButtonListener();
          postEvent('web_app_setup_secondary_button', { is_visible: false });
          postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: true });
        };
      }
    } else {
      postEvent('web_app_setup_closing_behavior', { need_confirmation: false });
    }
  }, [items, showButton]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, updateQuantity, setShowButton }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}