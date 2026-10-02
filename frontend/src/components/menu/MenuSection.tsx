/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import type { MenuItem } from "../../types/menu";
import type { Category } from "../../types/category";
type Props = {
  menus: MenuItem[];
  categories: Category[];
  category: string;
  onCategory: (c: string) => void;
  onAdd: (m: Omit<MenuItem, "id">) => void;
  onSave: (m: MenuItem) => void;
  onDelete: (id: number) => void;
  onCategorySave: (category: Category) => void;
  onCategoryDelete: (id: number) => void;
};
export function MenuSection({
  menus,
  categories,
  category,
  onCategory,
  onAdd,
  onSave,
  onDelete,
  onCategorySave,
  onCategoryDelete,
}: Props) {
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", categoryId: "", price: "" });
  const cats = categories.map((item) => item.name);
  const shown = menus.filter((m) => m.category.name === category);
  const start = (m?: MenuItem) => {
    setEditing(m?.id ?? 0);
    setForm({
      name: m?.name ?? "",
      categoryId: m?.category.id.toString() ?? "",
      price: m?.price.toString() ?? "",
    });
  };
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-bold tracking-[.2em] text-emerald-700">
            MENU
          </p>
          <h2 className="mt-1 text-2xl font-bold">Menu items</h2>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              name: form.name.trim(),
              category: categories.find((item) => item.id === Number(form.categoryId)),
              price: Number(form.price),
            };
            if (!payload.name || !payload.category || payload.price < 0) return;
            const menu = { ...payload, category: payload.category };
            editing && editing > 0
              ? onSave({ id: editing, ...menu })
              : onAdd(menu);
            setEditing(null);
            setForm({ name: "", categoryId: "", price: "" });
          }}
          className="grid grid-cols-2 gap-2 sm:flex"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">Category</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input
            required
            min="0"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            className="min-w-0 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">
            {editing ? "Save" : "Add item"}
          </button>
          {editing !== null && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", categoryId: "", price: "" });
              }}
              className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      {cats.length === 0 ? (
        <p className="mb-5 py-6 text-center text-sm text-slate-400">No categories yet. Add a category below to get started.</p>
      ) : (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onCategory(cat.name)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${category === cat.name ? "bg-emerald-700 text-white" : "border border-slate-200 text-slate-600 hover:border-emerald-500"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {cats.length === 0 ? "Add a category first, then add menu items." : "No items in this category."}
          </p>
        ) : shown.map((menu) => (
          <article
            key={menu.id}
            className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {menu.category.name}
              </p>
              <h3 lang="my" className="break-words text-base font-bold text-slate-900">
                {menu.name}
              </h3>
            </div>
            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <p className="whitespace-nowrap font-bold text-emerald-700">
                {menu.price.toLocaleString()} MMK
              </p>
              <div className="flex gap-3">
              <button
                type="button"
                onClick={() => start(menu)}
                className="text-xs font-bold text-slate-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => { if (window.confirm(`Are you sure you want to delete '${menu.name}'?`)) onDelete(menu.id); }}
                className="text-xs font-bold text-rose-600"
              >
                Delete
              </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <CategoryManager categories={categories} onSave={onCategorySave} onDelete={onCategoryDelete} />
    </section>
  );
}

function CategoryManager({ categories, onSave, onDelete }: { categories: Category[]; onSave: (category: Category) => void; onDelete: (id: number) => void }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  return <div className="mt-7 border-t border-slate-200 pt-5">
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-bold">Categories</h3><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; onSave({ id: editing ?? 0, name: name.trim() }); setName(""); setEditing(null); }}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" className="min-w-0 w-36 rounded-xl border border-slate-200 px-3 py-2 text-sm" /><button className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">{editing ? "Save" : "Add"}</button></form></div>
    <div className="flex flex-wrap gap-2">{categories.map((item) => <span key={item.id} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm"><button type="button" onClick={() => { setEditing(item.id); setName(item.name); }}>{item.name}</button><button type="button" onClick={() => { if (window.confirm(`Are you sure you want to delete category '${item.name}'?`)) onDelete(item.id); }} className="font-bold text-rose-600">×</button></span>)}</div>
  </div>;
}
