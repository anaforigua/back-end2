import React from "react";

const money = value => "$" + Number(value).toLocaleString("es-CO");

export function ProductCard({ product, seller, onEdit, onDelete, onBuy }) {
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
            <button 
              className="btn secondary" 
              onClick={onEdit}
              style={{ transition: "all 0.2s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(112, 71, 239, 0.2)";
                e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              Editar
            </button>
            <button 
              className="btn danger" 
              onClick={onDelete}
              style={{ transition: "all 0.2s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(239, 71, 111, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Eliminar
            </button>
          </div>
        ) : (
          <button 
            className="btn full" 
            disabled={!product.stock} 
            onClick={onBuy}
            style={{ transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              if (product.stock) {
                e.currentTarget.style.boxShadow = "0 0 15px rgba(112, 71, 239, 0.5)";
                e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.8)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "";
            }}
          >
            {product.stock ? "Agregar al carrito" : "Agotado"}
          </button>
        )}
      </div>
    </article>
  );
}