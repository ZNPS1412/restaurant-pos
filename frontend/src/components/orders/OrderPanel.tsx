import { useEffect, useState } from "react";
import type { MenuItem } from "../../types/menu";
import type { Category } from "../../types/category";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
import { CheckoutPanel } from "../checkout/CheckoutPanel";
type Props = {
  order: Order;
  table: RestaurantTable;
  menus: MenuItem[];
  categories: Category[];
  tables: RestaurantTable[];
  onAdd: (id: number) => void;
  onChange: (id: number, q: number) => void;
  onTransfer: (id: number) => void;
  onCheckout: (
    order: Order,
    paymentMethod: string,
    amountPaid: number,
  ) => Promise<void>;
};
export function OrderPanel({
  order,
  table,
  menus,
  categories,
  tables,
  onAdd,
  onChange,
  onTransfer,
  onCheckout,
}: Props) {
  const active = order.status === "OPEN";
  // Empty string = not yet chosen; defaulted to first category via useEffect.
  const [category, setCategory] = useState("");
  // Default to the first category on mount / when categories change; fallback if deleted.
  useEffect(() => {
    if (categories.length === 0) return;
    const exists = categories.some((c) => c.name === category);
    if (!exists) setCategory(categories[0].name);
  }, [categories, category]);
  const visibleMenus = menus.filter((menu) => menu.category.name === category);
  const orderedMenuIds = new Set(order.items.map((item) => item.menuId));
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[.2em] text-emerald-700">
            {active ? "ACTIVE ORDER" : "COMPLETED ORDER"}
          </p>
          <h2 className="mt-1 break-words text-2xl font-bold">
            Order #{order.id} <span className="text-slate-400">·</span> Table{" "}
            {table.tableNumber}
          </h2>
        </div>
        {active && (
          <select
            value={table.id}
            onChange={(e) => onTransfer(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
          >
            <option value={table.id}>Change table...</option>
            {tables
              .filter((t) => t.status === "AVAILABLE")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.tableNumber}
                </option>
              ))}
          </select>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {active && (
            <>
              {categories.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No categories yet. Add categories in the Menu page.</p>
              ) : (
                <>
                  <div className="category-scroll mb-3 flex gap-2 overflow-x-auto pb-1 flex-nowrap">
                    {categories.map((item) => (
                      <button type="button" key={item.id} onClick={() => setCategory(item.name)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${category === item.name ? "bg-emerald-700 text-white" : "border border-slate-200 text-slate-600"}`}>
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {visibleMenus.length === 0 ? (
                    <p className="col-span-full py-6 text-center text-sm text-slate-400">No items in this category.</p>
                  ) : visibleMenus.map((menu) => (
                    <button
                      type="button"
                      key={menu.id}
                      onClick={() => onAdd(menu.id)}
                      className={`min-w-0 rounded-2xl border p-4 text-left transition ${orderedMenuIds.has(menu.id) ? "border-rose-300 bg-rose-100 hover:border-rose-400 hover:bg-rose-200" : "border-slate-100 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50"}`}
                    >
                      <p lang="my" className="min-h-12 break-words font-bold">
                        {menu.name}
                      </p>
                      <p className={`mt-2 text-sm font-bold ${orderedMenuIds.has(menu.id) ? "text-rose-700" : "text-emerald-700"}`}>
                        {menu.price.toLocaleString()} MMK
                      </p>
                    </button>
                  ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <aside className="rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 font-bold">Current order</h3>
          {order.items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-xl border-b border-rose-200 bg-rose-100 px-3 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
              <div className="min-w-0">
                <span className="break-words font-semibold">
                  {menus.find((m) => m.id === item.menuId)?.name ?? "Menu item"}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  {item.unitPrice.toLocaleString()} MMK each
                </p>
              </div>
              <strong className="whitespace-nowrap text-sm">{item.subtotal.toLocaleString()} MMK</strong>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                {active && (
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        const removingLastItem =
                          item.quantity === 1 && order.items.length === 1;
                        if (
                          !removingLastItem ||
                          window.confirm(
                            "Remove the last item from this order? This will make the table available.",
                          )
                        ) {
                          onChange(item.id, item.quantity - 1);
                        }
                      }}
                      className="grid size-7 place-items-center rounded-lg bg-white text-base font-bold shadow-sm"
                    >
                      −
                    </button>
                    {item.quantity}
                    <button
                      type="button"
                      onClick={() => onChange(item.id, item.quantity + 1)}
                      className="grid size-7 place-items-center rounded-lg bg-white text-base font-bold shadow-sm"
                    >
                      +
                    </button>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{order.total.toLocaleString()} MMK</span>
          </div>
          {active ? (
            <CheckoutPanel order={order} onCheckout={onCheckout} />
          ) : (
            <p className="mt-4 rounded-xl bg-emerald-100 p-3 text-xs font-semibold text-emerald-800">
              COMPLETED · {order.paymentMethod} · Paid{" "}
              {order.amountPaid?.toLocaleString()} MMK · Change{" "}
              {order.changeAmount?.toLocaleString()} MMK
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
