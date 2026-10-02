import { useMemo, useState } from "react";
import type { Order } from "../../types/order";

type Props = {
  order: Order;
  onCheckout: (
    order: Order,
    paymentMethod: string,
    amountPaid: number,
  ) => Promise<void>;
};

export function CheckoutPanel({ order, onCheckout }: Props) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const amount = Number(amountPaid);
  const validAmount =
    amountPaid.trim() !== "" &&
    Number.isFinite(amount) &&
    amount >= order.total;
  const change = validAmount ? amount - order.total : 0;
  const validation = useMemo(() => {
    if (!order.items.length) return "Add at least one item before checkout.";
    if (!paymentMethod) return "Select Cash or KBZ Pay.";
    if (!validAmount) return "Enter a valid amount paid.";
    if (amount < order.total) return "Amount paid must cover the order total.";
    return "";
  }, [amount, order.items.length, order.total, paymentMethod, validAmount]);

  const submit = async () => {
    if (validation) return;
    await onCheckout(order, paymentMethod, amount);
    setPaymentMethod("CASH");
    setAmountPaid("");
  };

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="font-bold">Checkout</h3>
      <label className="mt-3 block text-xs font-semibold text-slate-500">
        Payment method
        <select
          aria-label="Payment method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="CASH">Cash</option>
          <option value="E_WALLET">KBZ Pay</option>
        </select>
      </label>
      <label className="mt-2 block text-xs font-semibold text-slate-500">
        Amount paid
        <input
          aria-label="Amount paid"
          type="number"
          min={order.total}
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="Enter amount in MMK"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        />
      </label>
      <div className="mt-3 flex justify-between text-sm text-slate-500">
        <span>Change</span>
        <strong className={change >= 0 ? "text-slate-800" : "text-rose-600"}>
          {change.toLocaleString()} MMK
        </strong>
      </div>
      {validation && (
        <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
          {validation}
        </p>
      )}
      <button
        type="button"
        disabled={Boolean(validation)}
        onClick={submit}
        className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Complete Sale
      </button>
    </div>
  );
}
