import React, { useState, useMemo } from "react";
import { Field } from "../components/Field";
import { ProductCard } from "../components/ProductCard";
import { CartModal } from "../components/modals/CartModal";

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

interface CartItem {
  id: number | string;
  qty: number;
}

interface BuyerViewProps {
  products: Product[];
  cart: CartItem[];
  onAddCart: (id: number | string) => void;
  onChangeQty: (id: number | string, delta: number) => void;
  onCheckout: () => void;
}

export function BuyerView({ products, cart, onAddCart, onChangeQty, onCheckout }: BuyerViewProps) {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("Todas");
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  const categories = ["Todas", ...new Set(products.map((p: Product) => p.category))];

  const filtered = useMemo(() => {
    return products.filter((p: Product) => {
      const matchCat = category === "Todas" || p.category === category;
      const matchText =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchText;
    });
  }, [products, search, category]);

  const total = cart.reduce((sum: number, item: CartItem) => {
    const p = products.find((x: Product) => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const totalCartItems = cart.reduce((s: number, i: CartItem) => s + i.qty, 0);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Catálogo de productos</h1>
          <p>Encuentra lo que necesitas y compra en pocos pasos.</p>
        </div>
        <button className="btn" onClick={() => setCartOpen(true)}>
          Carrito ({totalCartItems})
        </button>
      </div>

      <div className="card filters">
        <Field label="Buscar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
          />
        </Field>
        <Field label="Categoría">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="product-grid">
        {filtered.map((p: Product) => (
          <ProductCard key={p.id} product={p} onBuy={() => onAddCart(p.id!)} />
        ))}
      </div>
      {!filtered.length && <div className="card empty">No encontramos productos con esos filtros.</div>}

      {cartOpen && (
        <CartModal
          cart={cart}
          products={products}
          total={total}
          onChangeQty={onChangeQty}
          onClose={() => setCartOpen(false)}
          onCheckout={onCheckout}
        />
      )}
    </main>
  );
}