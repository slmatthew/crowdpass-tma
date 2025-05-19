export type CartItem = {
  event: { id: number; name: string; };
  ticketTypeId: number;
  ticketTypeName: string;
  price: number;
  quantity: number;
};