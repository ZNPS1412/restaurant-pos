import { request } from "../lib/api";
import type { MenuItem } from "../types/menu";
export const menuService = {
  list: () => request<MenuItem[]>("/menus"),
  create: (data: Omit<MenuItem, "id">) =>
    request<MenuItem>("/menus", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Omit<MenuItem, "id">) =>
    request<MenuItem>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) => request<void>(`/menus/${id}`, { method: "DELETE" }),
};
