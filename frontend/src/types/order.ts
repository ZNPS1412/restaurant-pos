export type OrderItem = {
  id: number;
  menuId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};
export type Order = {
  id: number;
  tableId: number;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod?: string;
  amountPaid?: number;
  changeAmount?: number;
};
