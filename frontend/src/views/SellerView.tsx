import React, { useState } from "react";
import { ProductModal } from "../components/modals/ProductModal";
import { SellerInventory } from "../components/SellerInventory";
import { Product, ProductId } from "../types/product";

interface SellerViewProps {
  products: Product[];
  onAdd: (product: Product) => void | Promise<void>;
  onUpdate: (product: Product) => void | Promise<void>;
  onDelete: (id: ProductId) => void | Promise<void>;
  onNotify?: (msg: string) => void;
}

export function SellerView({
  products,
  onAdd,
  onUpdate,
  onDelete,
}: SellerViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const totalStock = products.reduce((sum: number, p) => sum + Number(p.stock || 0), 0);
  const outOfStockCount = products.filter((p) => Number(p.stock || 0) === 0).length;

  const handleSaveProduct = async (p: Product) => {
    try {
      if (p.id !== undefined) await onUpdate(p);
      else await onAdd(p);
      setEditing(null);
    } catch { /* App muestra el error; el formulario permanece abierto para reintentar. */ }
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Panel del vendedor</h1>
          <p>Administra tu catálogo e inventario.</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setEditing({
              name: "",
              description: "",
              price: 0,
              stock: 0,
              category: "Tecnología",
              emoji: "📦",
            })
          }
          style={{ transition: "all 0.3s ease" }}
        >
          + Agregar producto
        </button>
      </div>

      <SellerInventory
        products={products}
        totalStock={totalStock}
        outOfStockCount={outOfStockCount}
        onEdit={(p) => setEditing(p)}
        onDelete={(id) => onDelete(id)}
      />

      {editing && (
        <ProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveProduct}
        />
      )}
    </main>
  );
}
