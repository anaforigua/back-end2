import React, { useState, useMemo } from "react";
import { Field } from "../components/Field";
import { ProductCard } from "../components/ProductCard";
import { CartModal } from "../components/modals/CartModal";

export function BuyerView({ products, cart, onAddCart, onChangeQty, onCheckout }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [cartOpen, setCartOpen] = useState(false);
  
  const categories = ["Todas", ...new Set(products.map(p => p.category))];
  
  const filtered = useMemo(() => products.filter(p =>
    (category === "Todas" || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  ), [products, search, category]);

  const total = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  return (
    <main className="page">
      <div className="page-title">
        <div><h1>Catálogo de productos</h1><p>Encuentra lo que necesitas y compra en pocos pasos.</p></div>
        <button className="btn" onClick={() => setCartOpen(true)}>Carrito ({cart.reduce((s,i)=>s+i.qty,0)})</button>
      </div>
      <div className="card filters">
        <Field label="Buscar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." /></Field>
        <Field label="Categoría"><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field>
      </div>
      <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onBuy={() => onAddCart(p.id)} />)}</div>
      {!filtered.length && <div className="card empty">No encontramos productos con esos filtros.</div>}
      {cartOpen && <CartModal cart={cart} products={products} total={total} onChangeQty={onChangeQty} onClose={() => setCartOpen(false)} onCheckout={() => { onCheckout(); setCartOpen(false); }} />}
    </main>
  );
}