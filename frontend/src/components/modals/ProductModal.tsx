// src/components/modals/ProductModal.tsx
import React, { useState } from "react";
import { Field } from "../Field";
import { compressProductImage } from "../../utils/avatarHelper";
import { ProductMedia } from "../ProductMedia";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  image?: string;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<Product>(product);

  const set = (key: keyof Product, value: any) => {
    setForm((v) => ({ ...v, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressProductImage(file);
      if (compressed.length > 500) {
        alert("El backend admite imágenes de hasta 500 caracteres. Ingresa una URL pública de imagen.");
        return;
      }
      setForm((prev) => ({ ...prev, emoji: compressed, image: compressed }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo cargar la imagen");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) <= 0) {
      alert("Ingresa un nombre y un precio mayor que cero.");
      return;
    }
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  const currentPreview = form.image || form.emoji || "📦";

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        backgroundColor: "rgba(6, 10, 28, 0.82)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#0e1532",
          border: "1px solid #263366",
          borderRadius: "18px",
          color: "#f8fafc",
        }}
      >
        <div className="modal-head" style={{ borderBottom: "1px solid #1f2b57", paddingBottom: "12px" }}>
          <h2>{product.id ? "Editar producto" : "Agregar producto"}</h2>
          <button type="button" onClick={onClose} className="x">✕</button>
        </div>

        <form onSubmit={submit} className="form">
          {/* Vista previa y subida de imagen desde el dispositivo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px",
              backgroundColor: "#131c3f",
              borderRadius: "12px",
              border: "1px solid #243060",
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "#162044",
                flexShrink: 0,
              }}
            >
              <ProductMedia src={currentPreview} alt={form.name || "Producto"} height="76px" />
            </div>

            <div style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "0.82rem", color: "#a5b4fc", marginBottom: "8px" }}>
                Imagen del producto
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <label
                  style={{
                    padding: "7px 13px",
                    borderRadius: "10px",
                    border: "1px solid #37437a",
                    backgroundColor: "#1b2652",
                    color: "#e0e7ff",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📷 Subir desde dispositivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>

                {currentPreview.startsWith("data:image") && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, emoji: "📦", image: "" }))}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      color: "#fca5a5",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <Field label="Nombre">
            <input value={form.name} maxLength={150} onChange={(e) => set("name", e.target.value)} required />
          </Field>

          <Field label="Descripción">
            <input value={form.description} maxLength={1000} onChange={(e) => set("description", e.target.value)} required />
          </Field>

          <Field label="URL pública de imagen (opcional)">
            <input
              type="url"
              maxLength={500}
              value={form.image?.startsWith("data:image/") ? "" : form.image || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value, emoji: e.target.value || "📦" }))}
              placeholder="https://..."
            />
          </Field>

          <div className="two">
            <Field label="Precio">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Categoría">
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="Tecnología">Tecnología</option>
              <option value="Hogar">Hogar</option>
              <option value="Ropa y accesorios">Ropa y accesorios</option>
              <option value="Deportes">Deportes</option>
              <option value="Libros y estudio">Libros y estudio</option>
              <option value="Videojuegos">Videojuegos</option>
            </select>
          </Field>

          <div className="actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
