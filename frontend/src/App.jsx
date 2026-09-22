import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./styles.css";

// Importación de vistas organizadas
import { LoginView } from "./views/LoginView";
import { RegisterView } from "./views/RegisterView";
import { RolesView } from "./views/RolesView";
import { SellerView } from "./views/SellerView";
import { BuyerView } from "./views/BuyerView";
import { BothView } from "./views/BothView";

// Importación de componentes globales
import { GlobalHeader } from "./components/GlobalHeader";

const seedProducts = [
  { id: 1, name: "Audífonos Pro", description: "Sonido inalámbrico y estuche de carga.", price: 129900, stock: 12, category: "Tecnología", emoji: "🎧" },
  { id: 2, name: "Smartwatch Fit", description: "Reloj inteligente para actividad diaria.", price: 189900, stock: 8, category: "Tecnología", emoji: "⌚" },
  { id: 3, name: "Mochila Urban", description: "Mochila resistente para estudio y trabajo.", price: 89900, stock: 15, category: "Accesorios", emoji: "🎒" },
  { id: 4, name: "Camiseta Basic", description: "Camiseta cómoda de algodón.", price: 49900, stock: 20, category: "Ropa", emoji: "👕" },
  { id: 5, name: "Teclado Mecánico", description: "Teclado compacto con retroiluminación.", price: 219900, stock: 5, category: "Tecnología", emoji: "⌨️" },
  { id: 6, name: "Botella Térmica", description: "Mantiene bebidas frías o calientes.", price: 59900, stock: 18, category: "Hogar", emoji: "🧴" }
];

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export function App() {
  const [products, setProducts] = useState(() => load("revenfy_products", seedProducts));
  const [cart, setCart] = useState(() => load("revenfy_cart", []));
  const [orders, setOrders] = useState(() => load("revenfy_orders", []));
  const [logged, setLogged] = useState(() => localStorage.getItem("revenfy_logged") === "1");
  const [email, setEmail] = useState(() => localStorage.getItem("revenfy_email") || "");
  const [toast, setToast] = useState("");

  useEffect(() => localStorage.setItem("revenfy_products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("revenfy_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("revenfy_orders", JSON.stringify(orders)), [orders]);

  const notify = message => {
    setToast(message);
    window.clearTimeout(window.__revenfyToast);
    window.__revenfyToast = window.setTimeout(() => setToast(""), 2200);
  };

  const login = value => {
    setEmail(value);
    setLogged(true);
    localStorage.setItem("revenfy_logged", "1");
    localStorage.setItem("revenfy_email", value);
  };

  const logout = () => {
    setLogged(false);
    localStorage.removeItem("revenfy_logged");
    localStorage.removeItem("revenfy_email");
  };

  const addProduct = product => {
    setProducts(current => [...current, { ...product, id: Date.now() }]);
    notify("Producto agregado");
  };

  const updateProduct = product => {
    setProducts(current => current.map(p => p.id === product.id ? product : p));
    notify("Producto actualizado");
  };

  const deleteProduct = id => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setProducts(current => current.filter(p => p.id !== id));
    setCart(current => current.filter(i => i.id !== id));
    notify("Producto eliminado");
  };

  const addToCart = id => {
    const product = products.find(p => p.id === id);
    if (!product || product.stock < 1) return notify("Producto agotado");
    setCart(current => {
      const found = current.find(i => i.id === id);
      if (found) {
        if (found.qty >= product.stock) return current;
        return current.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...current, { id, qty: 1 }];
    });
    notify("Producto agregado al carrito");
  };

  const changeQty = (id, delta) => {
    const product = products.find(p => p.id === id);
    setCart(current => current.flatMap(i => {
      if (i.id !== id) return [i];
      const next = i.qty + delta;
      if (next <= 0) return [];
      if (product && next > product.stock) return [i];
      return [{ ...i, qty: next }];
    }));
  };

  const checkout = () => {
    if (!cart.length) return notify("El carrito está vacío");
    const invalid = cart.some(i => {
      const p = products.find(x => x.id === i.id);
      return !p || i.qty > p.stock;
    });
    if (invalid) return notify("Revisa el stock");
    const total = cart.reduce((sum, i) => sum + products.find(p => p.id === i.id).price * i.qty, 0);
    setProducts(current => current.map(p => {
      const item = cart.find(i => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setOrders(current => [{
      id: "RF-" + String(Date.now()).slice(-6),
      date: new Date().toLocaleString("es-CO"),
      total,
      units: cart.reduce((sum, i) => sum + i.qty, 0),
      status: "Confirmado"
    }, ...current]);
    setCart([]);
    notify("Compra realizada correctamente");
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginView onLogin={login} />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/roles" element={<Protected logged={logged}><RolesView /></Protected>} />
        <Route path="/vendedor" element={<Protected logged={logged}><SellerView products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} /></Protected>} />
        <Route path="/comprador" element={<Protected logged={logged}><BuyerView products={products} cart={cart} onAddCart={addToCart} onChangeQty={changeQty} onCheckout={checkout} /></Protected>} />
        <Route path="/ambos" element={<Protected logged={logged}><BothView products={products} orders={orders} /></Protected>} />
        <Route path="*" element={<Navigate to={logged ? "/roles" : "/login"} replace />} />
      </Routes>
      {logged && <GlobalHeader email={email} onLogout={logout} cartCount={cart.reduce((s, i) => s + i.qty, 0)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function Protected({ logged, children }) {
  return logged ? children : <Navigate to="/login" replace />;
}