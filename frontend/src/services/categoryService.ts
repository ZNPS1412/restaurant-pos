import { request } from "../lib/api";
import type { Category } from "../types/category";

export const categoryService = {
  list: () => request<Category[]>("/categories"),
  create: (data: Pick<Category, "name">) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Pick<Category, "name">) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),
};
