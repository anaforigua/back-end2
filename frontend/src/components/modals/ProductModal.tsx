import React, { useState } from "react";
import { Field } from "../Field";
import { ImageUploadField } from "../ImageUploadField";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  imageFile?: File;
  [key: string]: any;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<Product>(product);

  const set = (key: keyof Product, value: any) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) < 0) return;
    onSave({ 
      ...form, 
      price: Number(form.price), 
      stock: Number(form.stock) 
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-head">
          <h2>{product.id ? "Editar producto" : "Agregar producto"}</h2>
          <button type="button" onClick={onClose} className="x">✕</button>
        </div>
        <form onSubmit={submit} className="form">
          <Field label="Nombre">
            <input value={form.name} onChange={e => set("name", e.target.value)} required />
          </Field>
          <Field label="Descripción">
            <input value={form.description} onChange={e => set("description", e.target.value)} required />
          </Field>
          
          <div className="two">
            <Field label="Precio">
              <input type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} required />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} required />
            </Field>
          </div>

          <Field label="Categoría">
            <select value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="Tecnología">Tecnología</option>
              <option value="Ropa">Ropa</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Hogar">Hogar</option>
            </select>
          </Field>
            
          {/* CAMBIO: Fuera de la cuadrícula, ocupando todo el ancho de forma limpia */}
          <div style={{ marginTop: '10px' }}>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Imagen del Producto</label>
            <ImageUploadField 
              onFileSelect={(file) => set("imageFile", file)} 
              label="" 
            />
          </div>

          <div className="actions" style={{ marginTop: '15px' }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}