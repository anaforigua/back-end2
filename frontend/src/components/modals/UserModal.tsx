// src/components/modals/UserModal.tsx
import React, { useState, useEffect } from "react";
import { User } from "../../types/user";
import { UserAvatar } from "../UserAvatar";

interface UserModalProps {
  isOpen: boolean;
  editingUser: User | null;
  onClose: () => void;
  onSave: (userData: Omit<User, "id_usuarios">, id?: number) => Promise<void>;
}

const AVAILABLE_ROLES = [
  { id: 2, label: "Vendedor" },
  { id: 3, label: "Comprador" },
];

const initialFormState: Omit<User, "id_usuarios"> = {
  nombre: "",
  apellidos: "",
  contrasena: "",
  avatar: "👤",
  biografia: "",
  ubicacion: "Bogotá D.C.",
  email: "",
  calificacion: 5.0,
  estado_usuario: "Activo",
  id_roles: [3],
};

export function UserModal({ isOpen, editingUser, onClose, onSave }: UserModalProps) {
  const [form, setForm] = useState<Omit<User, "id_usuarios">>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({
        nombre: editingUser.nombre,
        apellidos: editingUser.apellidos,
        contrasena: "",
        avatar: editingUser.avatar || "👤",
        biografia: editingUser.biografia || "",
        ubicacion: editingUser.ubicacion || "Bogotá D.C.",
        email: editingUser.email,
        calificacion: editingUser.calificacion ?? 5.0,
        estado_usuario: editingUser.estado_usuario || "Activo",
        id_roles: editingUser.id_roles?.length ? editingUser.id_roles : [3],
      });
    } else {
      setForm(initialFormState);
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const toggleRole = (roleId: number) => {
    setForm((prev) => {
      const exists = prev.id_roles.includes(roleId);
      const nextRoles = exists
        ? prev.id_roles.filter((r) => r !== roleId)
        : [...prev.id_roles, roleId];
      return { ...prev, id_roles: nextRoles.length ? nextRoles : [3] };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Recorte cuadrado centrado (aspect ratio 1:1)
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);

        setForm((prev) => ({ ...prev, avatar: compressedDataUrl }));
      };
      img.src = String(event.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editingUser && !payload.contrasena) {
        delete payload.contrasena;
      }
      await onSave(payload, editingUser?.id_usuarios);
      onClose();
    } catch {
      // El llamador ya comunica el error; conserva el formulario abierto.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>
            {editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}
          </h3>
          <button type="button" onClick={onClose} className="btn" style={{ padding: "4px 10px" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          {/* Selector y Vista Previa de Foto de Perfil */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "6px 0" }}>
            <UserAvatar avatar={form.avatar} alt={form.nombre} size={64} />
            <div style={{ flex: 1 }}>
              <label className="muted" style={{ fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>
                Foto de Perfil (desde tu dispositivo)
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <label
                  className="btn"
                  style={{ padding: "6px 12px", fontSize: "0.82rem", cursor: "pointer", margin: 0 }}
                >
                  📷 Seleccionar Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {form.avatar.startsWith("data:image") && (
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: "6px 10px", fontSize: "0.8rem", opacity: 0.75 }}
                    onClick={() => setForm({ ...form, avatar: "👤" })}
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: "0.85rem" }}>URL pública del avatar (opcional)</label>
            <input
              type="url"
              value={form.avatar.startsWith("http") ? form.avatar : ""}
              onChange={(e) => setForm({ ...form, avatar: e.target.value || "👤" })}
              placeholder="https://..."
              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Nombre *</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Apellidos *</label>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: "0.85rem" }}>Correo Institucional / Personal *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>
                {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña *"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={form.contrasena || ""}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                placeholder={editingUser ? "Dejar vacío para mantener" : "••••••••"}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Estado de Cuenta</label>
              <select
                value={form.estado_usuario}
                onChange={(e) => setForm({ ...form, estado_usuario: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Ubicación / Sede SENA</label>
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Calificación</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.calificacion}
                onChange={(e) => setForm({ ...form, calificacion: Number(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div>
            <label className="muted" style={{ fontSize: "0.85rem" }}>Biografía</label>
            <textarea
              rows={2}
              value={form.biografia}
              onChange={(e) => setForm({ ...form, biografia: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label className="muted" style={{ fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>
              Roles Asignados
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {editingUser?.id_roles.includes(1) ? (
                <span className="muted">El rol administrador se conserva; el backend no permite asignarlo desde este formulario.</span>
              ) : AVAILABLE_ROLES.map((role) => {
                const active = form.id_roles.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: active ? "2px solid #2563eb" : "1px solid #ccc",
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#1d4ed8" : "inherit",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {active ? "✓ " : ""}{role.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn" style={{ opacity: 0.8 }}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Guardando..." : editingUser ? "Actualizar Usuario" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
