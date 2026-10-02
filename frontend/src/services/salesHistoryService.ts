import { request } from "../lib/api";
import type { SalesHistory } from "../types/sales";

export const salesHistoryService = {
  list: (from: string, to: string) =>
    request<SalesHistory>(`/sales-history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  update: (id: number, paymentMethod: string, amountPaid: number) =>
    request(`/sales-history/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ paymentMethod, amountPaid }),
    }),
  remove: (id: number) =>
    request<void>(`/sales-history/orders/${id}`, { method: "DELETE" }),
};
