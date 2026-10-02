import { request } from "../lib/api";
import type { Order } from "../types/order";
export const orderService = {
  list: () => request<Order[]>("/orders"),
  create: (tableId: number) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({ tableId }),
    }),
  addItem: (id: number, menuId: number) =>
    request<Order>(`/orders/${id}/items`, {
      method: "POST",
      body: JSON.stringify({ menuId, quantity: 1 }),
    }),
  updateItem: (id: number, itemId: number, quantity: number) =>
    request<Order>(`/orders/${id}/items/${itemId}`, {
      method: quantity <= 0 ? "DELETE" : "PUT",
      ...(quantity > 0 ? { body: JSON.stringify({ quantity }) } : {}),
    }),
  transfer: (id: number, tableId: number) =>
    request<Order>(`/orders/${id}/transfer`, {
      method: "POST",
      body: JSON.stringify({ tableId }),
    }),
  checkout: (id: number, paymentMethod: string, amountPaid: number) =>
    request<Order>(`/orders/${id}/checkout`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod, amountPaid }),
    }),
};
