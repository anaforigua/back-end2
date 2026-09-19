import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import "./styles.css";

const seedProducts = [
  { id: 1, name: "Audífonos Pro", description: "Sonido inalámbrico y estuche de carga.", price: 129900, stock: 12, category: "Tecnología", emoji: "🎧" },
  { id: 2, name: "Smartwatch Fit", description: "Reloj inteligente para actividad diaria.", price: 189900, stock: 8, category: "Tecnología", emoji: "⌚" },
  { id: 3, name: "Mochila Urban", description: "Mochila resistente para estudio y trabajo.", price: 89900, stock: 15, category: "Accesorios", emoji: "🎒" },
  { id: 4, name: "Camiseta Basic", description: "Camiseta cómoda de algodón.", price: 49900, stock: 20, category: "Ropa", emoji: "👕" },
  { id: 5, name: "Teclado Mecánico", description: "Teclado compacto con retroiluminación.", price: 219900, stock: 5, category: "Tecnología", emoji: "⌨️" },
  { id: 6, name: "Botella Térmica", description: "Mantiene bebidas frías o calientes.", price: 59900, stock: 18, category: "Hogar", emoji: "🧴" }
];

const money = value => "$" + Number(value).toLocaleString("es-CO");
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

function App() {
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

  return <>
    <Routes>
      <Route path="/login" element={<Login onLogin={login} />} />
      <Route path="/roles" element={<Protected logged={logged}><Roles /></Protected>} />
      <Route path="/vendedor" element={<Protected logged={logged}><Seller products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} /></Protected>} />
      <Route path="/comprador" element={<Protected logged={logged}><Buyer products={products} cart={cart} onAddCart={addToCart} onChangeQty={changeQty} onCheckout={checkout} /></Protected>} />
      <Route path="/ambos" element={<Protected logged={logged}><Both products={products} orders={orders} /></Protected>} />
      <Route path="*" element={<Navigate to={logged ? "/roles" : "/login"} replace />} />
    </Routes>
    {logged && <GlobalHeader email={email} onLogout={logout} cartCount={cart.reduce((s, i) => s + i.qty, 0)} />}
    {toast && <div className="toast">{toast}</div>}
  </>;
}

function Protected({ logged, children }) {
  return logged ? children : <Navigate to="/login" replace />;
}

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = e => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email);
    navigate("/roles");
  };

  return <main className="login-page">
    <section className="login-shell">
      <div className="login-brand">
        <div className="logo">REVEN<span>FY</span></div>
        <div className="brand-copy">
          <h1>Compra.<br/>Vende.<br/>Crece.</h1>
          <p>Una plataforma para gestionar productos, compras y ventas desde un solo lugar.</p>
        </div>
        <div className="notice">Interfaz React funcional · datos locales para pruebas</div>
      </div>
      <div className="login-form">
        <h2>Iniciar sesión</h2>
        <p className="muted">Ingresa para seleccionar tu rol.</p>
        <form onSubmit={submit} className="form">
          <Field label="Correo electrónico">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@revenfy.com" />
          </Field>
          <Field label="Contraseña">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <button className="btn full">Ingresar</button>
        </form>
        <p className="muted small">Para esta demo puedes usar cualquier correo y contraseña.</p>
      </div>
    </section>
  </main>;
}

function GlobalHeader({ email, onLogout, cartCount }) {
  return <header className="bottom-nav">
    <div className="bottom-brand">
      <NavLink to="/roles" className="logo">REVEN<span>FY</span></NavLink>
      <span className="brand-caption">Tu marketplace, tus reglas</span>
    </div>

    <nav className="nav">
      <NavLink to="/vendedor">
        <span className="nav-icon">⌂</span>
        <span>Vender</span>
      </NavLink>
      <NavLink to="/comprador">
        <span className="nav-icon">🛒</span>
        <span>Comprar</span>
        <span className="counter">{cartCount}</span>
      </NavLink>
      <NavLink to="/ambos">
        <span className="nav-icon">♧</span>
        <span>Ambos</span>
      </NavLink>
    </nav>

    <div className="account">
      <div className="avatar">○</div>
      <span className="user-email">{email}</span>
      <button className="nav-btn" onClick={onLogout}>Salir ↪</button>
    </div>
  </header>;
}

function Roles() {
  return <main className="role-page">
    <div className="role-heading">
      <div className="role-brand-pill"><span>▣</span> Revenfy</div>
      <h1>¿Cómo quieres usar <span>Revenfy</span>?</h1>
      <p>Selecciona el rol que necesitas para continuar.</p>
    </div>

    <div className="role-grid">
      <RoleCard to="/vendedor" icon="🏪" title="Vendedor"
        text="Publica productos, controla inventario y gestiona tus ventas."
        button="Quiero Vender" />
      <RoleCard to="/comprador" icon="🛍️" title="Comprador"
        text="Explora productos, filtra, agrega al carrito y compra."
        button="Quiero Comprar" recommended />
      <RoleCard to="/ambos" icon="🔄" title="Vendedor + Comprador"
        text="Accede a las funciones de compra y venta desde la misma cuenta."
        button="Quiero Todo" />
    </div>
  </main>;
}

function RoleCard({ to, icon, title, text, button, recommended }) {
  return <NavLink to={to} className={`card role-card ${recommended ? "recommended" : ""}`}>
    {recommended && <div className="recommended-badge">✨ MÁS RECOMENDADO</div>}
    <div className="role-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{text}</p>
    <div className="role-action">{button}<span>→</span></div>
  </NavLink>;
}

function Seller({ products, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock), 0);
  return <main className="page">
    <div className="page-title">
      <div><h1>Panel del vendedor</h1><p>Administra tu catálogo e inventario.</p></div>
      <button className="btn" onClick={() => setEditing({ name:"", description:"", price:"", stock:"", category:"Tecnología", emoji:"📦" })}>+ Agregar producto</button>
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
  </main>;
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product);
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }));
  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) < 0) return;
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };
  return <div className="modal-backdrop"><div className="modal">
    <div className="modal-head"><h2>{product.id ? "Editar producto" : "Agregar producto"}</h2><button onClick={onClose} className="x">×</button></div>
    <form onSubmit={submit} className="form">
      <Field label="Nombre"><input value={form.name} onChange={e => set("name", e.target.value)} required /></Field>
      <Field label="Descripción"><input value={form.description} onChange={e => set("description", e.target.value)} /></Field>
      <div className="two"><Field label="Precio"><input type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} required /></Field><Field label="Stock"><input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} required /></Field></div>
      <div className="two"><Field label="Categoría"><select value={form.category} onChange={e => set("category", e.target.value)}><option>Tecnología</option><option>Ropa</option><option>Accesorios</option><option>Hogar</option></select></Field><Field label="Emoji"><input value={form.emoji} onChange={e => set("emoji", e.target.value)} /></Field></div>
      <div className="actions"><button type="button" className="btn secondary" onClick={onClose}>Cancelar</button><button className="btn">Guardar</button></div>
    </form>
  </div></div>;
}

function ProductCard({ product, seller, onEdit, onDelete, onBuy }) {
  return <article className="card product-card">
    <div className="product-img">{product.emoji}</div>
    <div className="product-body">
      <span className="tag">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="muted">{product.description}</p>
      <div className="price">{money(product.price)}</div>
      <div className="stock">Stock: <strong>{product.stock}</strong></div>
      {seller ? <div className="actions"><button className="btn secondary" onClick={onEdit}>Editar</button><button className="btn danger" onClick={onDelete}>Eliminar</button></div> : <button className="btn full" disabled={!product.stock} onClick={onBuy}>{product.stock ? "Agregar al carrito" : "Agotado"}</button>}
    </div>
  </article>;
}

function Buyer({ products, cart, onAddCart, onChangeQty, onCheckout }) {
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

  return <main className="page">
    <div className="page-title"><div><h1>Catálogo de productos</h1><p>Encuentra lo que necesitas y compra en pocos pasos.</p></div><button className="btn" onClick={() => setCartOpen(true)}>Carrito ({cart.reduce((s,i)=>s+i.qty,0)})</button></div>
    <div className="card filters"><Field label="Buscar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." /></Field><Field label="Categoría"><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field></div>
    <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onBuy={() => onAddCart(p.id)} />)}</div>
    {!filtered.length && <div className="card empty">No encontramos productos con esos filtros.</div>}
    {cartOpen && <CartModal cart={cart} products={products} total={total} onChangeQty={onChangeQty} onClose={() => setCartOpen(false)} onCheckout={() => { onCheckout(); setCartOpen(false); }} />}
  </main>;
}

function CartModal({ cart, products, total, onChangeQty, onClose, onCheckout }) {
  return <div className="modal-backdrop"><div className="modal wide">
    <div className="modal-head"><h2>Tu carrito</h2><button onClick={onClose} className="x">×</button></div>
    {!cart.length ? <div className="empty">Tu carrito está vacío.</div> : <>
      {cart.map(item => {
        const p = products.find(x => x.id === item.id); if (!p) return null;
        return <div className="cart-row" key={item.id}><div><strong>{p.name}</strong><span className="muted">{money(p.price)} × {item.qty}</span></div><div className="actions"><button className="qty" onClick={() => onChangeQty(p.id,-1)}>−</button><span>{item.qty}</span><button className="qty" onClick={() => onChangeQty(p.id,1)}>+</button></div></div>;
      })}
      <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
      <div className="actions"><button className="btn secondary" onClick={onClose}>Cerrar</button><button className="btn" onClick={onCheckout}>Confirmar compra</button></div>
    </>}
  </div></div>;
}

function Both({ products, orders }) {
  const sales = orders.reduce((sum, o) => sum + o.total, 0);
  return <main className="page">
    <div className="page-title"><div><h1>Mi espacio</h1><p>Compra y vende usando la misma cuenta.</p></div></div>
    <div className="stats"><Stat label="Productos en catálogo" value={products.length}/><Stat label="Pedidos realizados" value={orders.length}/><Stat label="Valor de compras" value={money(sales)}/></div>
    <div className="two-panels">
      <div className="card"><h2>Acciones rápidas</h2><p className="muted">Accede directamente a las funciones principales.</p><div className="actions"><NavLink className="btn" to="/vendedor">Administrar productos</NavLink><NavLink className="btn secondary" to="/comprador">Explorar catálogo</NavLink></div></div>
      <div className="card"><h2>Video de referencia</h2><video className="video" controls preload="metadata"><source src="/assets/demo.mp4" type="video/mp4"/></video></div>
    </div>
    <div className="card orders"><h2>Historial de pedidos</h2><div className="table-wrap"><table><thead><tr><th>Pedido</th><th>Fecha</th><th>Unidades</th><th>Total</th><th>Estado</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.date}</td><td>{o.units}</td><td>{money(o.total)}</td><td><span className="tag">{o.status}</span></td></tr>)}{!orders.length && <tr><td colSpan="5" className="empty">Aún no hay pedidos.</td></tr>}</tbody></table></div></div>
  </main>;
}

function Stat({ label, value }) { return <div className="card stat"><span className="muted">{label}</span><strong>{value}</strong></div>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }

createRoot(document.getElementById("root")).render(<BrowserRouter><App /></BrowserRouter>);
