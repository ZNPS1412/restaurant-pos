export type TableStatus = "AVAILABLE" | "OCCUPIED";
export type RestaurantTable = {
  id: number;
  tableNumber: number;
  status: TableStatus;
};
