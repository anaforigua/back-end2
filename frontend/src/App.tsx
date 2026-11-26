import React, { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginView } from "./views/LoginView";
import { RegisterView } from "./views/RegisterView";
import { SellerView } from "./views/SellerView";
import { BuyerView } from "./views/BuyerView";
import { BothView } from "./views/BothView";
import { GlobalHeader } from "./components/GlobalHeader";
import { AdminView } from "./views/AdminView";
import { RolesView } from "./views/RolesView";
import { authService } from "./services/authService";
import { orderService, BackendOrder } from "./services/orderService";
import { productService } from "./services/productService";
import { userService } from "./services/userService";
import { Product, ProductId } from "./types/product";
import { User, UserCreateInput } from "./types/user";

interface Order {
  id: string;
  date: string;
  units: number;
  total: number;
  status: string;
  buyerId?: number;
}

interface CartItem {
  id: ProductId;
  qty: number;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("revenfy_user");
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    return user && typeof user.id_usuarios === "number" ? user : null;
  } catch {
    return null;
  }
}

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("revenfy_cart");
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value as CartItem[] : [];
  } catch {
    return [];
  }
}

function clearStoredSession(): void {
  localStorage.removeItem("revenfy_token");
  localStorage.removeItem("revenfy_user");
  localStorage.removeItem("revenfy_logged");
  localStorage.removeItem("revenfy_email");
}

function categoryId(category: string): number {
  const key = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  const ids: Record<string, number> = {
    tecnologia: 1,
    hogar: 2,
    ropa: 3,
    accesorios: 3,
    "ropa y accesorios": 3,
    deportes: 4,
    "libros y estudio": 5,
    videojuegos: 6,
  };
  return ids[key] ?? 1;
}

function toApiProduct(product: Product): Record<string, unknown> {
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const candidateImage = String(product.image ?? "").trim();
  const image = /^(https?:\/\/|\/|data:image\/)/i.test(candidateImage)
    ? candidateImage
    : "";
  return {
    nombre: product.name.trim(),
    descripcion: product.description.trim() || "Sin descripción",
    precio: Number(product.price),
    cantidad: stock,
    condicion_producto: "Nuevo",
    id_categoria: categoryId(product.category),
    imagenes_producto: image,
    estado_producto: stock > 0 ? "Disponible" : "Agotado",
    id_pais_de_origen: 1,
  };
}

function mapOrder(order: BackendOrder): Order {
  const details = order.detalles ?? [];
  const id = order.id_pedidos ?? order.id_pedido ?? "";
  return {
    id: String(id),
    date: order.fecha ? new Date(order.fecha).toLocaleString("es-CO") : "—",
    units: details.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0),
    total: details.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0),
    status: String(order.estado_pedido ?? "Pendiente"),
    buyerId: Number(order.id_usuarios ?? order.id_usuario) || undefined,
  };
}

export function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessionUser, setSessionUser] = useState<User | null>(readStoredUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [toast, setToast] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const refreshProducts = useCallback(async () => {
    setProducts(await productService.getAll());
  }, []);

  const refreshOrders = useCallback(async (userId: number, isAdmin: boolean) => {
    const records = await orderService.getOrders();
    const visibleOrders = isAdmin
      ? records
      : records.filter((order) => Number(order.id_usuarios ?? order.id_usuario) === userId);
    setOrders(visibleOrders.map(mapOrder));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("revenfy_token");
    const savedUser = readStoredUser();
    if (!token || !savedUser?.id_usuarios) {
      clearStoredSession();
      setSessionUser(null);
      setAuthLoading(false);
      return;
    }

    void userService.getById(savedUser.id_usuarios)
      .then((user) => {
        setSessionUser(user);
        localStorage.setItem("revenfy_user", JSON.stringify(user));
      })
      .catch(() => {
        clearStoredSession();
        setSessionUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    void refreshProducts().catch((error: unknown) => {
      notify(error instanceof Error ? error.message : "No se pudo cargar el catálogo.");
    });
  }, [refreshProducts, notify]);

  useEffect(() => {
    localStorage.setItem("revenfy_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!sessionUser?.id_usuarios) {
      setOrders([]);
      return;
    }
    void refreshOrders(sessionUser.id_usuarios, sessionUser.id_roles.includes(1)).catch((error: unknown) => {
      notify(error instanceof Error ? error.message : "No se pudo cargar el historial de pedidos.");
    });
  }, [sessionUser, refreshOrders, notify]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const isAdmin = sessionUser?.id_roles?.includes(1) ?? false;
  const logged = Boolean(sessionUser?.id_usuarios && localStorage.getItem("revenfy_token"));

  const updateSessionUser = (updatedUser: User) => {
    setSessionUser(updatedUser);
    localStorage.setItem("revenfy_user", JSON.stringify(updatedUser));
    notify("Perfil actualizado.");
  };

  const login = async (value: string, password: string) => {
    clearStoredSession();
    const result = await authService.login(value, password);
    localStorage.setItem("revenfy_token", result.token);
    localStorage.setItem("revenfy_user", JSON.stringify(result.user));
    setSessionUser(result.user);
    navigate(result.user.id_roles.includes(1) ? "/admin" : "/roles", { replace: true });
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const payload: UserCreateInput = {
      nombre: data.firstName,
      apellidos: data.lastName,
      avatar: "👤",
      biografia: "",
      ubicacion: "Bogotá D.C.",
      email: data.email,
      contrasena: data.password,
      calificacion: 5,
      estado_usuario: "Activo",
      id_roles: [2, 3],
    };
    await authService.register(payload);
  };

  const logout = () => {
    clearStoredSession();
    setSessionUser(null);
    setCart([]);
    navigate("/login", { replace: true });
  };

  const addProduct = async (product: Product) => {
    try {
      const created = await productService.create(toApiProduct(product));
      setProducts((current) => [created, ...current]);
      notify("Producto publicado en el catálogo.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo publicar el producto.");
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    if (product.id === undefined) return addProduct(product);
    try {
      const updated = await productService.update(product.id, toApiProduct(product));
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
      notify("Producto actualizado.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo actualizar el producto.");
      throw error;
    }
  };

  const deleteProduct = async (id: ProductId) => {
    if (!window.confirm("¿Eliminar este producto del catálogo compartido?")) return;
    try {
      await productService.delete(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      setCart((current) => current.filter((item) => item.id !== id));
      notify("Producto eliminado del catálogo.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    }
  };

  const addToCart = (id: ProductId) => {
    const product = products.find((item) => item.id === id);
    if (!product || product.stock < 1) {
      notify("Producto agotado.");
      return;
    }
    setCart((current) => {
      const found = current.find((item) => item.id === id);
      if (found) {
        if (found.qty >= product.stock) {
          notify("No hay más unidades disponibles.");
          return current;
        }
        return current.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { id, qty: 1 }];
    });
    notify("Producto agregado al carrito.");
  };

  const changeQty = (id: ProductId, delta: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const next = item.qty + delta;
      if (next <= 0) return [];
      const product = products.find((entry) => entry.id === id);
      if (product && next > product.stock) {
        notify("No hay más unidades disponibles.");
        return [item];
      }
      return [{ ...item, qty: next }];
    }));
  };

  const checkout = async () => {
    if (checkoutSubmitting) return;
    if (!cart.length) {
      notify("El carrito está vacío.");
      return;
    }
    if (!sessionUser?.id_usuarios) {
      notify("Inicia sesión antes de confirmar el pedido.");
      return;
    }
    const details = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return { product, item };
    });
    if (details.some(({ product, item }) => !product || item.qty > (product?.stock ?? 0))) {
      notify("Revisa la disponibilidad de los productos en el carrito.");
      await refreshProducts().catch(() => undefined);
      return;
    }

    setCheckoutSubmitting(true);
    try {
      await orderService.createOrder({
        tipo_de_pago: "Pendiente de pago",
        estado_pedido: "PENDIENTE",
        id_usuarios: sessionUser.id_usuarios,
        detalles: details.map(({ product, item }) => ({
          id_productos: Number(product?.id),
          cantidad: item.qty,
        })),
      });
      setCart([]);
      notify("Pedido registrado. El backend actualizó las existencias.");
      await Promise.all([
        refreshProducts(),
        refreshOrders(sessionUser.id_usuarios, sessionUser.id_roles.includes(1)),
      ]);
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo registrar el pedido.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  if (authLoading) {
    return <main className="page"><div className="card">Verificando la sesión…</div></main>;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={logged ? <Navigate to={isAdmin ? "/admin" : "/roles"} replace /> : <LoginView onLogin={login} />} />
        <Route path="/register" element={logged ? <Navigate to="/roles" replace /> : <RegisterView onRegister={register} />} />
        <Route path="/roles" element={<Protected logged={logged}><RolesView isAdmin={isAdmin} /></Protected>} />
        <Route path="/admin" element={<AdminProtected logged={logged} isAdmin={isAdmin}><AdminView products={products} orders={orders} currentUserId={sessionUser?.id_usuarios ?? 0} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} onNotify={notify} /></AdminProtected>} />
        <Route path="/vendedor" element={<Protected logged={logged}><SellerView products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} onNotify={notify} /></Protected>} />
        <Route path="/comprador" element={<Protected logged={logged}><BuyerView products={products} cart={cart} onAddCart={addToCart} onChangeQty={changeQty} onCheckout={checkout} /></Protected>} />
        <Route path="/ambos" element={<Protected logged={logged}><BothView products={products} orders={orders} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} onNotify={notify} /></Protected>} />
        <Route path="*" element={<Navigate to={logged ? (isAdmin ? "/admin" : "/roles") : "/login"} replace />} />
      </Routes>

      {logged && sessionUser && <GlobalHeader user={sessionUser} onProfileUpdated={updateSessionUser} onLogout={logout} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
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

interface AdminProtectedProps extends ProtectedProps {
  isAdmin: boolean;
}

function AdminProtected({ logged, isAdmin, children }: AdminProtectedProps) {
  if (!logged) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/roles" replace />;
  return <>{children}</>;
}
