export type SaleItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Sale = {
  id: number;
  createdAt: string;
  completedAt: string;
  tableNumber: number | null;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
};

export type SalesHistory = {
  orders: Sale[];
  summary: {
    orderCount: number;
    totalSales: number;
    averageOrder: number;
  };
};
