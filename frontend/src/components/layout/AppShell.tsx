import type { ReactNode } from "react";
type Props = {
  children: ReactNode;
  section: string;
  onSectionChange: (section: string) => void;
};
export function AppShell({ children, section, onSectionChange }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="mb-12 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-lg font-black text-white">
            R
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-emerald-700">
              LOCAL POS
            </p>
            <p className="font-bold">Counter</p>
          </div>
        </div>
        <nav className="space-y-2">
          {["Dashboard", "Menu", "Sales History"].map((item) => (
            <button
              key={item}
              onClick={() => onSectionChange(item)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${section === item ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] text-emerald-700">
              RESTAURANT FLOOR
            </p>
            <h1 className="text-lg font-bold">{section}</h1>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="size-2 rounded-full bg-emerald-500" /> Local mode
          </span>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 pb-24 sm:p-8 sm:pb-24 lg:pb-12">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 p-2 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        {["Dashboard", "Menu", "Sales History"].map((item) => (
          <button
            key={item}
            onClick={() => onSectionChange(item)}
            className={`flex min-h-12 flex-1 items-center justify-center rounded-xl px-2 text-xs font-bold transition ${section === item ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}
