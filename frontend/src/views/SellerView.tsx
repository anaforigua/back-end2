import React, { useState } from "react";
import { ProductModal } from "../components/modals/ProductModal";
import { SellerInventory } from "../components/SellerInventory";
import { ApiError } from "../services/api";
import { productService } from "../services/productService";
import { Product, ProductId } from "../types/product";

interface SellerProductPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  condicion_producto: string;
  id_categoria: number;
  imagenes_producto: string;
  estado_producto: string;
  id_pais_de_origen: number;
  [key: string]: unknown;
}

interface ProductCreateResponse {
  data?: {
    id?: ProductId;
  };
}

interface SellerViewProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: ProductId) => void;
  onNotify?: (msg: string) => void;
}

export function SellerView({
  products,
  onAdd,
  onUpdate,
  onDelete,
  onNotify,
}: SellerViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const totalStock = products.reduce((sum: number, p) => sum + Number(p.stock || 0), 0);
  const outOfStockCount = products.filter((p) => Number(p.stock || 0) === 0).length;

  const handleSaveProduct = async (p: Product) => {
    const mediaValue = p.image || p.emoji || "📦";
    const safePrice = Math.max(0, Number(p.price) || 0);
    const safeStock = Math.max(0, Math.floor(Number(p.stock) || 0));

    const normalizedProduct: Product = {
      ...p,
      price: safePrice,
      stock: safeStock,
      emoji: mediaValue,
      image: mediaValue,
    };

    const backendData: SellerProductPayload = {
      nombre: normalizedProduct.name.trim(),
      descripcion: normalizedProduct.description.trim() || "Sin descripción",
      precio: safePrice,
      cantidad: safeStock,
      condicion_producto: "Nuevo",
      id_categoria: 1,
      imagenes_producto: mediaValue,
      estado_producto: safeStock > 0 ? "Disponible" : "Agotado",
      id_pais_de_origen: 1,
    };

    try {
      if (normalizedProduct.id !== undefined) {
        await productService.update(normalizedProduct.id, backendData);
        onUpdate(normalizedProduct);
      } else {
        const response = await productService.create<ProductCreateResponse>(backendData);
        const createdId = response?.data?.id;
        onAdd(
          createdId !== undefined
            ? { ...normalizedProduct, id: createdId }
            : normalizedProduct
        );
      }
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiError) {
        onNotify?.(error.message);
        return;
      }

      // Respaldo local únicamente ante fallo de conexión con el servidor
      if (normalizedProduct.id !== undefined) {
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