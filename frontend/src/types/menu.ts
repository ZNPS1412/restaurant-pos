import type { Category } from "./category";

export type MenuItem = {
  id: number;
  name: string;
  category: Category;
  price: number;
};
