import React from "react";
import { Stat } from "./Stat";
import { ProductCard } from "./ProductCard";

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

interface SellerInventoryProps {
  products: Product[];
  totalStock: number;
  outOfStockCount: number;
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
}

export function SellerInventory({
  products,
  totalStock,
  outOfStockCount,
  onEdit,
  onDelete,
}: SellerInventoryProps) {
  return (
    <>
      <div className="stats">
        <Stat label="Productos publicados" value={products.length} />
        <Stat label="Unidades en inventario" value={totalStock} />
        <Stat label="Productos agotados" value={outOfStockCount} />
      </div>

      <div className="product-grid">
        {products.map((p: Product) => (
          <ProductCard
            key={p.id}
            product={p}
            seller
            onEdit={() => onEdit(p)}
            onDelete={() => onDelete(p.id!)}
          />
        ))}
      </div>
    </>
  );
}