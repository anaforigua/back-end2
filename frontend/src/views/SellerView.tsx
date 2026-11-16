// src/views/SellerView.tsx
import React, { useState } from "react";
import { ProductModal } from "../components/modals/ProductModal";
import { SellerInventory } from "../components/SellerInventory";
import { productService } from "../services/productService";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  image?: string;
  [key: string]: any;
}

interface SellerViewProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: number | string) => void;
}

export function SellerView({ products, onAdd, onUpdate, onDelete }: SellerViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const totalStock = products.reduce((sum: number, p: Product) => sum + Number(p.stock), 0);
  const outOfStockCount = products.filter((p: Product) => Number(p.stock) === 0).length;

  const handleSaveProduct = async (p: Product) => {
    const mediaValue = p.image || p.emoji || "📦";
    const normalizedProduct: Product = {
      ...p,
      emoji: mediaValue,
      image: mediaValue,
    };

    try {
      const backendData = {
        nombre: normalizedProduct.name,
        descripcion: normalizedProduct.description || "Sin descripción",
        precio: Number(normalizedProduct.price),
        cantidad: Number(normalizedProduct.stock),
        condicion_producto: "Nuevo",
        id_categoria: 1,
        imagenes_producto: mediaValue,
        estado_producto: Number(normalizedProduct.stock) > 0 ? "Disponible" : "Agotado",
        id_pais_de_origen: 1,
      };

      if (normalizedProduct.id) {
        await productService.update(normalizedProduct.id, backendData);
        onUpdate(normalizedProduct);
      } else {
        const response = await productService.create(backendData);
        onAdd(response?.data ? { ...normalizedProduct, id: response.data.id } : normalizedProduct);
      }
      setEditing(null);
    } catch {
      // Respaldo local si el backend no está activo
      if (normalizedProduct.id) {
        onUpdate(normalizedProduct);
      } else {
        onAdd(normalizedProduct);
      }
      setEditing(null);
    }
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Panel del vendedor</h1>
          <p>Administra tu catálogo e inventario.</p>
        </div>
        <button
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