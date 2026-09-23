import React from "react";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
}

interface ProductCardProps {
  product: Product;
  seller?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onBuy?: () => void;
}

const money = (value: number) => "$" + Number(value).toLocaleString("es-CO");

export function ProductCard({ product, seller, onEdit, onDelete, onBuy }: ProductCardProps) {
  return (
    <article className="card product-card">
      <div className="product-img">{product.emoji || "📦"}</div>
      <div className="product-body">
        <span className="tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <div className="price">{money(product.price)}</div>
        <div className="stock">Stock: <strong>{product.stock}</strong></div>
        
        {seller ? (
          <div className="actions">
            <button className="btn secondary" onClick={onEdit} style={{ transition: "all 0.2s ease" }}>
              Editar
            </button>
            <button className="btn danger" onClick={onDelete} style={{ transition: "all 0.2s ease" }}>
              Eliminar
            </button>
          </div>
        ) : (
          <div className="actions">
            <button className="btn" onClick={onBuy}>Comprar</button>
          </div>
        )}
      </div>
    </article>
  );
}