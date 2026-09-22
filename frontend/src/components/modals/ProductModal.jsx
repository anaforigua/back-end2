import React, { useState } from "react";
import { Field } from "../Field";

export function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product);
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }));
  
  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) < 0) return;
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>{product.id ? "Editar producto" : "Agregar producto"}</h2>
          <button onClick={onClose} className="x">×</button>
        </div>
        <form onSubmit={submit} className="form">
          <Field label="Nombre"><input value={form.name} onChange={e => set("name", e.target.value)} required /></Field>
          <Field label="Descripción"><input value={form.description} onChange={e => set("description", e.target.value)} /></Field>
          <div className="two">
            <Field label="Precio"><input type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} required /></Field>
            <Field label="Stock"><input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} required /></Field>
          </div>
          <div className="two">
            <Field label="Categoría">
              <select value={form.category} onChange={e => set("category", e.target.value)}>
                <option>Tecnología</option><option>Ropa</option><option>Accesorios</option><option>Hogar</option>
              </select>
            </Field>
            <Field label="Emoji"><input value={form.emoji} onChange={e => set("emoji", e.target.value)} /></Field>
          </div>
          <div className="actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button className="btn">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}