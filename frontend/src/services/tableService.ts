import { request } from "../lib/api";
import type { RestaurantTable } from "../types/table";
export const tableService = {
  list: () => request<RestaurantTable[]>("/tables"),
  create: (tableNumber: number) =>
    request<RestaurantTable>("/tables", {
      method: "POST",
      body: JSON.stringify({ tableNumber }),
    }),
  remove: (id: number) => request<void>(`/tables/${id}`, { method: "DELETE" }),
};
