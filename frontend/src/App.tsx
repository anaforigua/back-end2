import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginView } from "./views/LoginView";
import { RegisterView } from "./views/RegisterView";
import { RolesView } from "./views/RolesView";
import { SellerView } from "./views/SellerView";
import { BuyerView } from "./views/BuyerView";
import { BothView } from "./views/BothView";
import { GlobalHeader } from "./components/GlobalHeader";

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

interface Order {
  id: string;
  date: string;
  units: number;
  total: number;
  status: string;
}

const seedProducts: Product[] = [
  { id: 1, name: "Teclado Mecánico RGB", description: "Switches red, retroiluminación personalizable", price: 250000, stock: 10, category: "Tecnología", emoji: "⌨️" },
  { id: 2, name: "Mouse Inalámbrico Ergonómico", description: "Sensor óptico de alta precisión", price: 95000, stock: 15, category: "Tecnología", emoji: "🖱️" },
  { id: 3, name: "Hoodie Oversize Básica", description: "100% algodón perchado, comfort fit", price: 120000, stock: 8, category: "Ropa", emoji: "🧥" },
  { id: 4, name: "Gafas de Sol Vintage", description: "Protección UV400, montura metálica", price: 65000, stock: 0, category: "Accesorios", emoji: "🕶️" }
];

const load = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export function App() {
  const [products, setProducts] = useState<Product[]>(() => load<Product[]>("revenfy_products", seedProducts));
  const [cart, setCart] = useState<CartItem[]>(() => load<CartItem[]>("revenfy_cart", []));
  const [orders, setOrders] = useState<Order[]>(() => load<Order[]>("revenfy_orders", []));
  const [logged, setLogged] = useState<boolean>(() => localStorage.getItem("revenfy_logged") === "1");
  const [email, setEmail] = useState<string>(() => localStorage.getItem("revenfy_email") || "");
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("revenfy_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("revenfy_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("revenfy_orders", JSON.stringify(orders));
  }, [orders]);

  const notify = (message: string) => {
    setToast(message);
    const win = window as any;
    if (win.__revenfyToast) {
      window.clearTimeout(win.__revenfyToast);
    }
    win.__revenfyToast = window.setTimeout(() => setToast(""), 2200);
  };

  const login = (value: string) => {
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

  const addProduct = (product: Product) => {
    setProducts((current: Product[]) => [...current, { ...product, id: Date.now() }]);
    notify("Producto agregado");
  };

  const updateProduct = (product: Product) => {
    setProducts((current: Product[]) =>
      current.map((p: Product) => (p.id === product.id ? product : p))
    );
    notify("Producto actualizado");
  };

  const deleteProduct = (id: number | string) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    setProducts((current: Product[]) => current.filter((p: Product) => p.id !== id));
    setCart((current: CartItem[]) => current.filter((i: CartItem) => i.id !== id));
    notify("Producto eliminado");
  };

  const addToCart = (id: number | string) => {
    const product = products.find((p: Product) => p.id === id);
    if (!product || product.stock < 1) {
      notify("Producto agotado");
      return;
    }
    setCart((current: CartItem[]) => {
      const found = current.find((i: CartItem) => i.id === id);
      if (found) {
        if (found.qty >= product.stock) return current;
        return current.map((i: CartItem) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...current, { id, qty: 1 }];
    });
    notify("Producto agregado al carrito");
  };

  const changeQty = (id: number | string, delta: number) => {
    setCart((current: CartItem[]) => {
      return current.flatMap((i: CartItem) => {
        if (i.id !== id) return [i];
        const next = i.qty + delta;
        if (next <= 0) return [];
        const product = products.find((p: Product) => p.id === id);
        if (product && next > product.stock) return [i];
        return [{ ...i, qty: next }];
      });
    });
  };

  const checkout = () => {
    if (!cart.length) return notify("El carrito está vacío");
    const invalid = cart.some((item: CartItem) => {
      const p = products.find((x: Product) => x.id === item.id);
      return !p || item.qty > p.stock;
    });
    if (invalid) return notify("Revisa el stock");

    const total = cart.reduce((sum: number, item: CartItem) => {
      const p = products.find((x: Product) => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);

    setProducts((current: Product[]) =>
      current.map((p: Product) => {
        const item = cart.find((i: CartItem) => i.id === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      })
    );

    setOrders((current: Order[]) => [
      {
        id: "RF-" + String(Date.now()).slice(-6),
        date: new Date().toLocaleString("es-CO"),
        units: cart.reduce((sum: number, i: CartItem) => sum + i.qty, 0),
        total,
        status: "Confirmado",
      },
      ...current,
    ]);

    setCart([]);
    notify("Compra realizada correctamente");
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginView onLogin={login} />} />
        <Route path="/register" element={<RegisterView />} />
        <Route
          path="/roles"
          element={
            <Protected logged={logged}>
              <RolesView />
            </Protected>
          }
        />
        <Route
          path="/vendedor"
          element={
            <Protected logged={logged}>
              <SellerView
                products={products}
                onAdd={addProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
              />
            </Protected>
          }
        />
        <Route
          path="/comprador"
          element={
            <Protected logged={logged}>
              <BuyerView
                products={products}
                cart={cart}
                onAddCart={addToCart}
                onChangeQty={changeQty}
                onCheckout={checkout}
              />
            </Protected>
          }
        />
        <Route
          path="/ambos"
          element={
            <Protected logged={logged}>
              <BothView products={products} orders={orders} />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to={logged ? "/roles" : "/login"} replace />} />
      </Routes>

      {logged && (
        <GlobalHeader
          email={email}
          onLogout={logout}
          cartCount={cart.reduce((s: number, i: CartItem) => s + i.qty, 0)}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

interface ProtectedProps {
  logged: boolean;
  children: React.ReactNode;
}

function Protected({ logged, children }: ProtectedProps) {
  return logged ? <>{children}</> : <Navigate to="/login" replace />;
}