import React, { useState } from "react";
import { Stat } from "../components/Stat";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/modals/ProductModal";

export function SellerView({ products, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock), 0);

  return (
    <main className="page">
      <div className="page-title">
        <div><h1>Panel del vendedor</h1><p>Administra tu catálogo e inventario.</p></div>
        <button 
          className="btn" 
          onClick={() => setEditing({ name:"", description:"", price:"", stock:"", category:"Tecnología", emoji:"📦" })}
          style={{ transition: "all 0.3s ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 15px rgba(112, 71, 239, 0.5)";
            e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.8)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          + Agregar producto
        </button>
      </div>
      <div className="stats">
        <Stat label="Productos publicados" value={products.length} />
        <Stat label="Unidades en inventario" value={totalStock} />
        <Stat label="Productos agotados" value={products.filter(p => p.stock === 0).length} />
      </div>
      <div className="product-grid">
        {products.map(p => <ProductCard key={p.id} product={p} seller onEdit={() => setEditing(p)} onDelete={() => onDelete(p.id)} />)}
      </div>
      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={p => { p.id ? onUpdate(p) : onAdd(p); setEditing(null); }} />}
    </main>
  );
}