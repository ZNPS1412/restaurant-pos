import { useState } from "react";
import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
import { TableCard } from "./TableCard";
type Props = {
  tables: RestaurantTable[];
  orders: Order[];
  onAdd: (n: number) => void;
  onOpen: (t: RestaurantTable) => void;
  onDelete: (id: number) => void;
};
export function TableSection({
  tables,
  orders,
  onAdd,
  onOpen,
  onDelete,
}: Props) {
  const [number, setNumber] = useState("");
  return (
    <section className="mb-8">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[.2em] text-emerald-700">
            TABLES
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            JOKER Restaurant floor
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open an available table to start an order.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(number);
            if (Number.isInteger(n) && n > 0) {
              onAdd(n);
              setNumber("");
            }
          }}
          className="flex gap-2"
        >
          <input
            required
            min="1"
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Table number"
            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <button
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
            type="submit"
          >
            Add table
          </button>
        </form>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            order={orders.find(
              (o) =>
                o.tableId === table.id &&
                o.status === "OPEN" &&
                o.items.length > 0,
            )}
            onOpen={() => onOpen(table)}
            onDelete={() => onDelete(table.id)}
          />
        ))}
      </div>
    </section>
  );
}
