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

  // Función para manejar el guardado conectando con el backend
  const handleSaveProduct = async (p: Product) => {
    try {
      const backendData = {
        nombre: p.name,
        descripcion: p.description || "Sin descripción",
        precio: Number(p.price),
        cantidad: Number(p.stock),
        condicion_producto: "Nuevo",
        id_categoria: 1,
        imagenes_producto: p.emoji || "📦",
        estado_producto: Number(p.stock) > 0 ? "Disponible" : "Agotado",
        id_pais_de_origen: 1
      };

      if (p.id) {
        await productService.update(p.id, backendData);
        onUpdate(p);
      } else {
        const response = await productService.create(backendData);
        onAdd(response?.data || p);
      }
      setEditing(null);
      alert("¡Producto guardado exitosamente en la base de datos!");
    } catch (error) {
      console.error("Error al guardar el producto en la base de datos:", error);
      alert("Hubo un error al guardar el producto.");
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

      {/* Componente modular integrado */}
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