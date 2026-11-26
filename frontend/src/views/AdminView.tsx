import React, { useState, useEffect, useMemo } from "react";
import { User } from "../types/user";
import { Product, ProductId } from "../types/product";
import { userService } from "../services/userService";
import { UserModal } from "../components/modals/UserModal";
import { UserAvatar } from "../components/UserAvatar";
import { compressProductImage } from "../utils/avatarHelper";
import { ProductMedia } from "../components/ProductMedia";

export interface AdminOrder {
  id: string;
  date: string;
  units: number;
  total: number;
  status: string;
  buyerId?: number;
  sellerEmail?: string;
}

interface AdminViewProps {
  products: Product[];
  orders?: AdminOrder[];
  currentUserId: number;
  onAddProduct: (product: Product) => void | Promise<void>;
  onUpdateProduct: (product: Product) => void | Promise<void>;
  onDeleteProduct: (id: ProductId) => void | Promise<void>;
  onNotify: (msg: string) => void;
}

const ROLE_NAMES: Record<number, string> = {
  1: "Administrador",
  2: "Vendedor",
  3: "Comprador",
};

const emptyProductForm: Product = {
  name: "",
  description: "",
  price: 0,
  stock: 1,
  category: "Tecnología",
  emoji: "📦",
};

function isSafeImagePreview(src: string | undefined): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  return (
    trimmed.startsWith("data:image/jpeg") ||
    trimmed.startsWith("data:image/jpg") ||
    trimmed.startsWith("data:image/png") ||
    trimmed.startsWith("data:image/webp") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/")
  );
}

export function AdminView({
  products,
  orders = [],
  currentUserId,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onNotify,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "products">("users");

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [roleFilter, setRoleFilter] = useState<string>("TODOS");
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [productSearch, setProductSearch] = useState<string>("");
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>(emptyProductForm);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      onNotify("Error al cargar usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserMetrics = (user: User) => {
    const hasProductOwnerData = products.some((product) => product.sellerId !== undefined);
    const matchedProducts = products.filter(
      (p) => p.sellerId !== undefined && String(p.sellerId) === String(user.id_usuarios ?? "")
    );

    const matchedPurchases = orders
      .filter((o) => o.buyerId === user.id_usuarios)
      .reduce((sum, o) => sum + o.units, 0);

    const published =
      user.productos_publicados ??
      (hasProductOwnerData ? matchedProducts.length : null);
    const purchased = user.productos_comprados ?? matchedPurchases;
    const sold = user.productos_vendidos ?? null;

    return { published, purchased, sold };
  };

  const handleSaveUser = async (userData: Omit<User, "id_usuarios">, id?: number) => {
    try {
      if (id !== undefined) {
        const updatePayload = userData.id_roles.includes(1)
          ? (({ id_roles: _ignored, ...rest }) => rest)(userData)
          : userData;
        const updated = await userService.update(id, updatePayload);
        setUsers((prev) =>
          prev.map((u) => (u.id_usuarios === id ? { ...u, ...updated } : u))
        );
        onNotify("Usuario actualizado correctamente");
      } else {
        if (!userData.contrasena) throw new Error("La contraseña es obligatoria para crear una cuenta.");
        const created = await userService.create({ ...userData, contrasena: userData.contrasena });
        setUsers((prev) => [created, ...prev]);
        onNotify("Usuario creado correctamente");
      }
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Error al guardar usuario");
      throw error;
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    if (!user.id_usuarios) return;
    const nextStatus = user.estado_usuario === "Activo" ? "Suspendido" : "Activo";
    try {
      await userService.update(user.id_usuarios, { ...user, estado_usuario: nextStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuarios === user.id_usuarios ? { ...u, estado_usuario: nextStatus } : u
        )
      );
      onNotify(`Estado cambiado a ${nextStatus}`);
    } catch {
      onNotify("No se pudo cambiar el estado del usuario");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user.id_usuarios) return;
    if (
      !window.confirm(
        `¿Eliminar permanentemente al usuario ${user.nombre} ${user.apellidos}?`
      )
    ) {
      return;
    }
    try {
      await userService.remove(user.id_usuarios);
      setUsers((prev) => prev.filter((u) => u.id_usuarios !== user.id_usuarios));
      onNotify("Usuario eliminado");
    } catch {
      onNotify("Error al eliminar el usuario");
    }
  };

  const openNewProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setIsProductFormOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedProduct: Product = {
      ...productForm,
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      description: productForm.description.trim(),
      price: Math.max(0, Number(productForm.price) || 0),
      stock: Math.max(0, Math.floor(Number(productForm.stock) || 0)),
    };

    if (!sanitizedProduct.name || !sanitizedProduct.category || sanitizedProduct.price <= 0) {
      onNotify("Ingresa nombre, categoría y un precio mayor que cero.");
      return;
    }

    try {
      if (editingProduct) {
        await onUpdateProduct({ ...sanitizedProduct, id: editingProduct.id });
      } else {
        await onAddProduct(sanitizedProduct);
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch {
      // App comunica el error y el formulario permanece abierto para corregirlo.
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText =
        !q ||
        `${u.nombre} ${u.apellidos} ${u.email} ${u.ubicacion}`
          .toLowerCase()
          .includes(q);
      const matchesStatus =
        statusFilter === "TODOS" ||
        u.estado_usuario.toLowerCase() === statusFilter.toLowerCase();
      const matchesRole =
        roleFilter === "TODOS" || (u.id_roles || []).includes(Number(roleFilter));
      return matchesText && matchesStatus && matchesRole;
    });
  }, [users, userSearch, statusFilter, roleFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const activeUsersCount = users.filter((u) => u.estado_usuario === "Activo").length;
  const totalOrdersUnits = orders.reduce((acc, o) => acc + Number(o.units || 0), 0);

  return (
    <main style={{ maxWidth: "1250px", margin: "90px auto 110px", padding: "0 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Panel de Administración <span>Revenfy</span>
          </h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Control de usuarios, roles, actividad de compra/venta y CRUD del catálogo
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn"
            style={{ opacity: activeTab === "users" ? 1 : 0.65 }}
            onClick={() => setActiveTab("users")}
          >
            👥 Usuarios ({users.length})
          </button>
          <button
            type="button"
            className="btn"
            style={{ opacity: activeTab === "products" ? 1 : 0.65 }}
            onClick={() => setActiveTab("products")}
          >
            📦 Productos ({products.length})
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ padding: "18px" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>Total Usuarios</span>
          <h2 style={{ margin: "6px 0 0" }}>{users.length}</h2>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>Usuarios Activos</span>
          <h2 style={{ margin: "6px 0 0", color: "#16a34a" }}>{activeUsersCount}</h2>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>Productos Publicados</span>
          <h2 style={{ margin: "6px 0 0" }}>{products.length}</h2>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <span className="muted" style={{ fontSize: "0.85rem" }}>Unidades Transaccionadas</span>
          <h2 style={{ margin: "6px 0 0", color: "#60a5fa" }}>{totalOrdersUnits}</h2>
        </div>
      </div>

      {activeTab === "users" && (
        <section className="card" style={{ padding: "20px" }}>
          <p role="note" className="muted" style={{ marginTop: 0 }}>
            El backend solo permite modificar la cuenta autenticada. La edición de terceros, suspensión y eliminación están deshabilitadas hasta que el backend implemente permisos administrativos.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
              <input
                type="text"
                placeholder="Buscar por nombre, correo o sede..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                  minWidth: "240px",
                }}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              >
                <option value="TODOS">Todos los roles</option>
                <option value="1">Administrador</option>
                <option value="2">Vendedor</option>
                <option value="3">Comprador</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Suspendido">Suspendidos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
            >
              + Nuevo Usuario
            </button>
          </div>

          {loadingUsers ? (
            <p className="muted">Cargando historial de usuarios...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #243060" }}>
                    <th style={{ padding: "12px 8px" }}>Usuario</th>
                    <th style={{ padding: "12px 8px" }}>Roles Asignados</th>
                    <th style={{ padding: "12px 8px" }}>Historial de Actividad</th>
                    <th style={{ padding: "12px 8px" }}>Estado</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const stats = getUserMetrics(user);
                    const mapsUrl = user.ubicacion
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          user.ubicacion
                        )}`
                      : "";

                    return (
                      <tr
                        key={user.id_usuarios ?? user.email}
                        style={{ borderBottom: "1px solid #1e2952" }}
                      >
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <UserAvatar
                              avatar={user.avatar}
                              alt={`${user.nombre} ${user.apellidos}`}
                              size={42}
                            />
                            <div>
                              <strong>
                                {user.nombre} {user.apellidos}
                              </strong>
                              <div className="muted" style={{ fontSize: "0.82rem" }}>
                                {user.email}
                              </div>
                              <div className="muted" style={{ fontSize: "0.78rem" }}>
                                {user.ubicacion ? (
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#c084fc", textDecoration: "none" }}
                                  >
                                    📍 {user.ubicacion} ↗
                                  </a>
                                ) : (
                                  "📍 Sin ubicación"
                                )}{" "}
                                · ⭐ {Number(user.calificacion || 5).toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {(user.id_roles || []).map((r) => (
                              <span
                                key={r}
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "3px 9px",
                                  borderRadius: "12px",
                                  background:
                                    r === 1 ? "#dbeafe" : r === 2 ? "#fef3c7" : "#e0e7ff",
                                  color:
                                    r === 1 ? "#1e40af" : r === 2 ? "#92400e" : "#3730a3",
                                  fontWeight: 600,
                                }}
                              >
                                {ROLE_NAMES[r] || `Rol ${r}`}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: "12px 8px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              fontSize: "0.8rem",
                            }}
                          >
                            <span
                              title="Productos publicados en catálogo"
                              style={{
                                padding: "3px 8px",
                                borderRadius: "8px",
                                background: "#f3f4f6",
                                color: "#1f2937",
                                fontWeight: 600,
                              }}
                            >
                              📦 Publicados: {stats.published ?? "N/D"}
                            </span>
                            <span
                              title="Productos vendidos"
                              style={{
                                padding: "3px 8px",
                                borderRadius: "8px",
                                background: "#ecfdf5",
                                color: "#065f46",
                                fontWeight: 600,
                              }}
                            >
                              💰 Vendidos: {stats.sold ?? "N/D"}
                            </span>
                            <span
                              title="Productos comprados"
                              style={{
                                padding: "3px 8px",
                                borderRadius: "8px",
                                background: "#eff6ff",
                                color: "#1e40af",
                                fontWeight: 600,
                              }}
                            >
                              🛒 Comprados: {stats.purchased}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "12px 8px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background:
                                user.estado_usuario === "Activo" ? "#dcfce7" : "#fee2e2",
                              color:
                                user.estado_usuario === "Activo" ? "#166534" : "#991b1b",
                            }}
                          >
                            {user.estado_usuario}
                          </span>
                        </td>

                        <td style={{ padding: "12px 8px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn"
                              disabled={user.id_usuarios !== currentUserId}
                              title={user.id_usuarios === currentUserId ? "Editar mi perfil" : "El backend no autoriza editar cuentas de terceros"}
                              style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                              onClick={() => {
                                setEditingUser(user);
                                setIsUserModalOpen(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn"
                              disabled
                              title="La gestión de estado de cuentas no está autorizada desde este panel"
                              style={{
                                padding: "5px 10px",
                                fontSize: "0.8rem",
                                opacity: 0.85,
                              }}
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              {user.estado_usuario === "Activo" ? "Suspender" : "Activar"}
                            </button>
                            <button
                              type="button"
                              className="btn"
                              disabled
                              title="La eliminación de usuarios no está habilitada desde este panel"
                              style={{
                                padding: "5px 10px",
                                fontSize: "0.8rem",
                                background: "#dc2626",
                                color: "#fff",
                              }}
                              onClick={() => handleDeleteUser(user)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ padding: "20px", textAlign: "center" }}
                        className="muted"
                      >
                        No se encontraron usuarios con ese criterio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "products" && (
        <section className="card" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar producto por nombre o categoría..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #283566",
                backgroundColor: "#162044",
                color: "#f8fafc",
                minWidth: "280px",
              }}
            />

            <button type="button" className="btn" onClick={openNewProductForm}>
              + Nuevo Producto
            </button>
          </div>

          {isProductFormOpen && (
            <form
              onSubmit={handleProductSubmit}
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "14px",
                backgroundColor: "#131c3f",
                border: "1px solid #283566",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              <input
                type="text"
                required
                placeholder="Nombre del producto"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              />
              <input
                type="text"
                required
                placeholder="Categoría"
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Precio COP"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    price: Math.max(0, Number(e.target.value)),
                  })
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              />
              <input
                type="number"
                required
                min={0}
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stock: Math.max(0, Math.floor(Number(e.target.value))),
                  })
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  className="btn"
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    margin: 0,
                  }}
                >
                  📷 Subir Foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const imgData = await compressProductImage(file);
                        setProductForm({ ...productForm, emoji: imgData, image: imgData });
                      } catch (err) {
                        onNotify(
                          err instanceof Error ? err.message : "Error al subir imagen"
                        );
                      }
                    }}
                  />
                </label>
                {isSafeImagePreview(productForm.emoji) && (
                  <img
                    src={productForm.emoji}
                    alt="Vista previa"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              <input
                type="url"
                placeholder="URL pública de imagen (opcional)"
                value={productForm.image?.startsWith("data:image/") ? "" : productForm.image || ""}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value, emoji: e.target.value || "📦" })}
                style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #283566", backgroundColor: "#162044", color: "#f8fafc" }}
              />
              <input
                type="text"
                required
                placeholder="Descripción"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #283566",
                  backgroundColor: "#162044",
                  color: "#f8fafc",
                  gridColumn: "1 / -1",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  gridColumn: "1 / -1",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  style={{ opacity: 0.75 }}
                  onClick={() => setIsProductFormOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn">
                  {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #243060" }}>
                  <th style={{ padding: "12px 8px" }}>Producto</th>
                  <th style={{ padding: "12px 8px" }}>Categoría</th>
                  <th style={{ padding: "12px 8px" }}>Precio</th>
                  <th style={{ padding: "12px 8px" }}>Stock</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={String(product.id ?? product.name)}
                    style={{ borderBottom: "1px solid #1e2952" }}
                  >
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            overflow: "hidden",
                            borderRadius: "8px",
                            flexShrink: 0,
                          }}
                        >
                          <ProductMedia
                            src={product.image || product.emoji}
                            alt={product.name}
                            height="44px"
                          />
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <div className="muted" style={{ fontSize: "0.8rem" }}>
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 8px" }}>{product.category}</td>
                    <td style={{ padding: "12px 8px" }}>
                      ${Number(product.price || 0).toLocaleString("es-CO")}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: product.stock > 0 ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {product.stock} uds.
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                          onClick={() => openEditProductForm(product)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "5px 10px",
                            fontSize: "0.8rem",
                            background: "#dc2626",
                            color: "#fff",
                          }}
                          onClick={() =>
                            product.id !== undefined && onDeleteProduct(product.id)
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <UserModal
        isOpen={isUserModalOpen}
        editingUser={editingUser}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
      />
    </main>
  );
}
