import type { Order } from "../../types/order";
import type { RestaurantTable } from "../../types/table";
type Props = {
  table: RestaurantTable;
  order?: Order;
  onOpen: () => void;
  onDelete: () => void;
};
export function TableCard({ table, order, onOpen, onDelete }: Props) {
  const available = table.status === "AVAILABLE";
  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${available ? "border-emerald-100 bg-white" : "border-amber-200 bg-amber-50/60"}`}
    >
      <div className="flex items-start gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left" type="button">
          <div className="flex items-start justify-between">
            <span className="text-2xl font-bold">{table.tableNumber}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
            >
              {table.status}
            </span>
          </div>
          {order && (
            <p className="mt-4 text-xs text-slate-500">
              Order #{order.id}
              <br />
              <strong className="text-sm text-slate-800">
                {order.total.toLocaleString()} MMK
              </strong>
            </p>
          )}
          {available && (
            <p className="mt-4 text-xs font-semibold text-emerald-700">
              Open table →
            </p>
          )}
        </button>
        {available && (
          <button
            type="button"
            aria-label={`Delete Table ${table.tableNumber}`}
            title="Delete table"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete Table ${table.tableNumber}?`)) {
                onDelete();
              }
            }}
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        )}
      </div>
    </article>
  );
}
