import { useEffect, useMemo, useState } from "react";
import { MenuSection } from "../components/menu/MenuSection";
import { OrderPanel } from "../components/orders/OrderPanel";
import { TableSection } from "../components/tables/TableSection";
import { SalesHistorySection } from "../components/sales/SalesHistorySection";
import { menuService } from "../services/menuService";
import { categoryService } from "../services/categoryService";
import { orderService } from "../services/orderService";
import { tableService } from "../services/tableService";
import type { MenuItem } from "../types/menu";
import type { Category } from "../types/category";
import type { Order } from "../types/order";
import type { RestaurantTable } from "../types/table";

type Props = { section: string; onError: (error: unknown) => void };

export function PosPage({ section, onError }: Props) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null,
  );
  // Empty string = "not yet chosen"; default is set once categories load.
  const [category, setCategory] = useState("");

  const refresh = async () => {
    const [menuItems, restaurantTables, currentOrders, currentCategories] = await Promise.all([
      menuService.list(),
      tableService.list(),
      orderService.list(),
      categoryService.list(),
    ]);
    setMenus(menuItems);
    setTables(restaurantTables);
    setOrders(currentOrders);
    setCategories(currentCategories);
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      menuService.list(),
      tableService.list(),
      orderService.list(),
      categoryService.list(),
    ])
      .then(([menuItems, restaurantTables, currentOrders, currentCategories]) => {
        if (!active) return;
        setMenus(menuItems);
        setTables(restaurantTables);
        setOrders(currentOrders);
        setCategories(currentCategories);
      })
      .catch(onError);

    return () => {
      active = false;
    };
  }, [onError]);

  // Default to the first category once categories load; fall back if selected is deleted.
  useEffect(() => {
    if (categories.length === 0) return;
    const exists = categories.some((c) => c.name === category);
    if (!exists) setCategory(categories[0].name);
  }, [categories, category]);

  const updateOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? order : item)),
    );
  };

  const syncTables = async () => {
    setTables(await tableService.list());
  };

  const openTable = async (table: RestaurantTable) => {
    if (selectedTable?.id === table.id) {
      setSelectedTable(null);
      setSelectedOrder(null);
      return;
    }

    try {
      const [currentTables, currentOrders] = await Promise.all([
        tableService.list(),
        orderService.list(),
      ]);
      setTables(currentTables);
      setOrders(currentOrders);

      const currentTable = currentTables.find((item) => item.id === table.id) ?? table;
      const openOrders = currentOrders.filter(
        (order) => order.tableId === table.id && order.status === "OPEN",
      );
      const ordersWithItems = openOrders.filter((order) => order.items.length > 0);
      if (ordersWithItems.length > 1) {
        throw new Error(
          `Table ${currentTable.tableNumber} has multiple active orders with items. Resolve the duplicate orders before opening the table.`,
        );
      }
      const existing =
        ordersWithItems[0] ??
        openOrders.sort((a, b) => a.id - b.id)[0];
      const order = existing ?? (await orderService.create(currentTable.id));
      setSelectedTable(currentTable);
      setSelectedOrder(order);
      if (!existing) {
        await refresh();
      }
    } catch (error) {
      onError(error);
    }
  };

  const addMenu = async (menu: MenuItem) => {
    if (selectedOrder?.status !== "OPEN") return;
    try {
      updateOrder(await orderService.addItem(selectedOrder.id, menu.id));
      await syncTables();
    } catch (error) {
      onError(error);
    }
  };

  const changeQuantity = async (itemId: number, quantity: number) => {
    if (!selectedOrder) return;
    try {
      updateOrder(
        await orderService.updateItem(selectedOrder.id, itemId, quantity),
      );
      await syncTables();
    } catch (error) {
      onError(error);
    }
  };

  const transfer = async (tableId: number) => {
    if (!selectedOrder) return;
    try {
      updateOrder(await orderService.transfer(selectedOrder.id, tableId));
      setSelectedTable(tables.find((table) => table.id === tableId) ?? null);
      await refresh();
    } catch (error) {
      onError(error);
    }
  };

  const checkout = async (
    order: Order,
    paymentMethod: string,
    amountPaid: number,
  ) => {
    try {
      updateOrder(
        await orderService.checkout(order.id, paymentMethod, amountPaid),
      );
      await refresh();
    } catch (error) {
      onError(error);
      throw error;
    }
  };

  const activeTable = useMemo(
    () =>
      selectedTable ??
      (selectedOrder
        ? tables.find((table) => table.id === selectedOrder.tableId)
        : null),
    [selectedTable, selectedOrder, tables],
  );

  const addTable = async (tableNumber: number) => {
    try {
      await tableService.create(tableNumber);
      await refresh();
    } catch (error) {
      onError(error);
    }
  };

  const deleteTable = async (id: number) => {
    try {
      await tableService.remove(id);
      await refresh();
    } catch (error) {
      onError(error);
    }
  };

  const saveMenu = async (menu: MenuItem | Omit<MenuItem, "id">) => {
    try {
      const saved = "id" in menu && menu.id
        ? await menuService.update(menu.id, menu)
        : await menuService.create(menu);
      setMenus((current) =>
        "id" in menu && menu.id
          ? current.map((item) => (item.id === menu.id ? saved : item))
          : [...current, saved],
      );
    } catch (error) {
      onError(error);
    }
  };

  const deleteMenu = async (id: number) => {
    try {
      await menuService.remove(id);
      setMenus((current) => current.filter((menu) => menu.id !== id));
    } catch (error) {
      onError(error);
    }
  };

  if (section === "Menu")
    return (
      <MenuSection
        menus={menus}
        categories={categories}
        category={category}
        onCategory={setCategory}
        onAdd={saveMenu}
        onSave={saveMenu}
        onDelete={deleteMenu}
        onCategorySave={async (item) => {
          try {
            const saved = item.id ? await categoryService.update(item.id, item) : await categoryService.create(item);
            setCategories((current) => item.id ? current.map((value) => value.id === item.id ? saved : value) : [...current, saved]);
          } catch (error) { onError(error); }
        }}
        onCategoryDelete={async (id) => {
          try { await categoryService.remove(id); setCategories((current) => current.filter((item) => item.id !== id)); }
          catch (error) { onError(error); }
        }}
      />
    );
  if (section === "Sales History") {
    return <SalesHistorySection onError={onError} />;
  }

  return (
    <>
      <TableSection
        tables={tables}
        orders={orders}
        onAdd={addTable}
        onOpen={openTable}
        onDelete={deleteTable}
      />
      {selectedOrder && activeTable && (
        <OrderPanel
          order={selectedOrder}
          table={activeTable}
          menus={menus}
          categories={categories}
          tables={tables}
          onAdd={(id) => {
            const menu = menus.find((item) => item.id === id);
            if (menu) addMenu(menu);
          }}
          onChange={changeQuantity}
          onTransfer={transfer}
          onCheckout={checkout}
        />
      )}
    </>
  );
}
