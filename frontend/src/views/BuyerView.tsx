import React, { useState, useMemo } from "react";
import { Field } from "../components/Field";
import { ProductCard } from "../components/ProductCard";
import { CartModal } from "../components/modals/CartModal";
import { Product, CartItem, ProductId } from "../types/product";

interface BuyerViewProps {
  products: Product[];
  cart: CartItem[];
  onAddCart: (id: ProductId) => void;
  onChangeQty: (id: ProductId, delta: number) => void;
  onCheckout: () => void;
}

export function BuyerView({
  products,
  cart,
  onAddCart,
  onChangeQty,
  onCheckout,
}: BuyerViewProps) {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("Todas");
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  const categories = useMemo(
    () => ["Todas", ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = category === "Todas" || p.category === category;
      const matchText =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchCat && matchText;
    });
  }, [products, search, category]);

  const total = cart.reduce((sum: number, item: CartItem) => {
    const p = products.find((x) => x.id === item.id);
    return sum + (p ? Number(p.price) * item.qty : 0);
  }, 0);

  const totalCartItems = cart.reduce((s: number, i: CartItem) => s + i.qty, 0);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Catálogo de productos</h1>
          <p>Encuentra lo que necesitas y compra en pocos pasos.</p>
        </div>
        <button type="button" className="btn" onClick={() => setCartOpen(true)}>
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
        {filtered.map((p) => (
          <ProductCard
            key={String(p.id ?? p.name)}
            product={p}
            onBuy={() => {
              if (p.id !== undefined) {
                onAddCart(p.id);
              }
            }}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="card empty">No encontramos productos con esos filtros.</div>
      )}

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