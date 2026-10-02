import { useEffect, useMemo, useState } from "react";
import { salesHistoryService } from "../../services/salesHistoryService";
import type { SalesHistory } from "../../types/sales";

type Period = "day" | "month" | "range";
const money = (value: number) => `${value.toLocaleString()} MMK`;

function localDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function rangeFor(
  period: Period,
  date: string,
  month: string,
  fromDate: string,
  toDate: string,
) {
  if (period === "month") {
    if (!month) return null;
    const [year, monthNumber] = month.split("-").map(Number);
    if (!year || !monthNumber) return null;
    return { from: new Date(year, monthNumber - 1, 1), to: new Date(year, monthNumber, 1) };
  }
  if (period === "range") {
    if (!fromDate || !toDate || fromDate > toDate) return null;
    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);
    end.setDate(end.getDate() + 1);
    return { from: start, to: end };
  }
  if (!date) return null;
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start, to: end };
}

export function SalesHistorySection({ onError }: { onError: (error: unknown) => void }) {
  const today = localDate(new Date());
  const [period, setPeriod] = useState<Period>("day");
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [history, setHistory] = useState<SalesHistory>({ orders: [], summary: { orderCount: 0, totalSales: 0, averageOrder: 0 } });
  const range = useMemo(() => rangeFor(period, date, month, fromDate, toDate), [date, fromDate, month, period, toDate]);
  const rangeReady = range !== null;

  useEffect(() => {
    if (!range) return;
    salesHistoryService.list(range.from.toISOString(), range.to.toISOString()).then(setHistory).catch(onError);
  }, [onError, range]);

  const visibleHistory = rangeReady ? history : { orders: [], summary: { orderCount: 0, totalSales: 0, averageOrder: 0 } };
  const summary = visibleHistory.summary;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMethod, setEditMethod] = useState("CASH");
  const [editAmount, setEditAmount] = useState("");

  const reload = async () => {
    if (!range) return;
    const next = await salesHistoryService.list(range.from.toISOString(), range.to.toISOString());
    setHistory(next);
  };

  const saveEdit = async (id: number, total: number) => {
    const amount = Number(editAmount);
    if (!Number.isFinite(amount) || amount < total) return;
    try {
      await salesHistoryService.update(id, editMethod, amount);
      setEditingId(null);
      await reload();
    } catch (error) {
      onError(error);
    }
  };

  const deleteSale = async (id: number) => {
    if (!window.confirm("Delete this completed sale? This permanently removes it from Sales History.")) return;
    try {
      await salesHistoryService.remove(id);
      await reload();
    } catch (error) {
      onError(error);
    }
  };

  return <section className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Completed sales</p><h2 className="mt-1 text-2xl font-black">Sales History</h2></div>
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">{(["day", "month", "range"] as Period[]).map((value) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-xl px-4 py-2 text-sm font-bold ${period === value ? "bg-emerald-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{value === "day" ? "Today" : value === "month" ? "This Month" : "Range"}</button>)}</div>
      {period === "day" && <label className="block max-w-xs text-sm font-semibold text-slate-600">Selected date<input className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value || today)} /></label>}
      {period === "month" && <label className="block max-w-xs text-sm font-semibold text-slate-600">Selected month<input className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3" type="month" value={month} onChange={(event) => setMonth(event.target.value || today.slice(0, 7))} /></label>}
      {period === "range" && <div className="grid max-w-xl gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-600">From<input className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3" type="date" value={fromDate} onChange={(event) => { const nextFrom = event.target.value; setFromDate(nextFrom); if (!nextFrom || toDate < nextFrom) setToDate(""); }} /></label><label className="text-sm font-semibold text-slate-600">To<input className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} /></label></div>}
    </div>
    <div><h3 className="mb-3 text-lg font-black">Sales Summary</h3><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Orders</p><p className="mt-1 text-2xl font-black">{summary.orderCount}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Total Sales</p><p className="mt-1 text-2xl font-black">{money(summary.totalSales)}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Average Order</p><p className="mt-1 text-2xl font-black">{money(summary.averageOrder)}</p></div></div></div>
    <div><h3 className="mb-3 text-lg font-black">Completed Sales</h3><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {visibleHistory.orders.map((sale) => editingId === sale.id ? (
        <div key={sale.id} className="border-b border-slate-100 p-4 last:border-0">
          <div className="flex flex-wrap items-center gap-3 text-sm"><strong>Order #{sale.id}</strong><span>{money(sale.total)}</span><select value={editMethod} onChange={(event) => setEditMethod(event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1"><option value="CASH">Cash</option><option value="KBZ_PAY">KBZ Pay</option></select><input type="number" min={sale.total} value={editAmount} onChange={(event) => setEditAmount(event.target.value)} className="w-32 rounded-lg border border-slate-200 px-2 py-1" /><button type="button" onClick={() => saveEdit(sale.id, sale.total)} className="font-bold text-emerald-700">Save</button><button type="button" onClick={() => setEditingId(null)} className="font-bold text-slate-500">Cancel</button></div>
        </div>
      ) : (
        <div key={sale.id} className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm"><strong>#{sale.id}</strong><span>Table {sale.tableNumber ?? "—"}</span><span className="text-slate-500">{new Date(sale.completedAt).toLocaleString()}</span></div>
          <div className="flex flex-wrap items-center gap-4 text-sm"><strong>{money(sale.total)}</strong><span>{sale.paymentMethod === "KBZ_PAY" || sale.paymentMethod === "E_WALLET" ? "KBZ Pay" : "Cash"}</span><button type="button" onClick={() => { setEditingId(sale.id); setEditMethod(sale.paymentMethod === "KBZ_PAY" || sale.paymentMethod === "E_WALLET" ? "KBZ_PAY" : "CASH"); setEditAmount(String(sale.amountPaid)); }} className="font-bold text-slate-600">Edit</button><button type="button" onClick={() => deleteSale(sale.id)} className="font-bold text-rose-600">Delete</button></div>
        </div>
      ))}
      {!visibleHistory.orders.length && <p className="p-8 text-center text-sm text-slate-500">{rangeReady ? "No completed sales for this period." : "Select both dates to view completed sales."}</p>}
    </div></div>
  </section>;
}
