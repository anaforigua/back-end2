// src/components/modals/ProfileModal.tsx
import React, { useState, useEffect } from "react";
import { User } from "../../types/user";
import { userService } from "../../services/userService";
import { UserAvatar } from "../UserAvatar";
import { compressImageFile, getOrCreateUserProfile } from "../../utils/avatarHelper";
import { getRealTimeLocation } from "../../utils/locationHelper";

interface ProfileModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onUpdated: (updatedUser: User) => void;
}

export function ProfileModal({ isOpen, email, onClose, onUpdated }: ProfileModalProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !email) return;
    setLoading(true);
    setPassword("");
    getOrCreateUserProfile(email)
      .then((user) => setProfile(user))
      .finally(() => setLoading(false));
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const compressed = await compressImageFile(file);
      setProfile({ ...profile, avatar: compressed });
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo cargar la foto");
    }
  };

  const handleDetectLocation = async () => {
    if (!profile) return;
    setLocating(true);
    try {
      const live = await getRealTimeLocation();
      setProfile({ ...profile, ubicacion: live.address });
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo obtener la ubicación");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.biografia || !profile.biografia.trim()) {
      alert("La biografía es obligatoria.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<User> = {
        nombre: profile.nombre,
        apellidos: profile.apellidos,
        avatar: profile.avatar,
        biografia: profile.biografia.trim(),
        ubicacion: profile.ubicacion,
        email: profile.email,
        calificacion: profile.calificacion,
        estado_usuario: profile.estado_usuario,
        id_roles: profile.id_roles,
      };

      if (password.trim()) {
        payload.contrasena = password.trim();
      }

      let saved: User;
      if (profile.id_usuarios !== undefined) {
        saved = await userService.update(profile.id_usuarios, payload);
      } else {
        saved = await userService.create(payload as Omit<User, "id_usuarios">);
      }

      onUpdated(saved);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const mapsUrl = profile?.ubicacion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.ubicacion)}`
    : "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: "16px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}>Mi Perfil en <span>Revenfy</span></h3>
          <button type="button" onClick={onClose} className="btn" style={{ padding: "4px 10px" }}>
            ✕
          </button>
        </div>

        {loading || !profile ? (
          <p className="muted">Cargando información de tu perfil...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            {/* Foto de perfil desde dispositivo */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "6px 0" }}>
              <UserAvatar avatar={profile.avatar} alt={profile.nombre} size={70} />
              <div>
                <label className="muted" style={{ fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>
                  Foto de Perfil
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <label
                    className="btn"
                    style={{ padding: "6px 12px", fontSize: "0.82rem", cursor: "pointer", margin: 0 }}
                  >
                    📷 Subir desde dispositivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  {profile.avatar?.startsWith("data:image") && (
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: "6px 10px", fontSize: "0.8rem", opacity: 0.75 }}
                      onClick={() => setProfile({ ...profile, avatar: "👤" })}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="muted" style={{ fontSize: "0.85rem" }}>Nombre *</label>
                <input
                  type="text"
                  required
                  value={profile.nombre}
                  onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label className="muted" style={{ fontSize: "0.85rem" }}>Apellidos *</label>
                <input
                  type="text"
                  required
                  value={profile.apellidos}
                  onChange={(e) => setProfile({ ...profile, apellidos: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>
            </div>

            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Correo Electrónico</label>
              <input
                type="email"
                disabled
                value={profile.email}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  opacity: 0.7,
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* Ubicación en tiempo real */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="muted" style={{ fontSize: "0.85rem" }}>Ubicación en Tiempo Real *</label>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                >
                  {locating ? "⏳ Detectando GPS..." : "📍 Usar mi ubicación actual"}
                </button>
              </div>
              <input
                type="text"
                required
                value={profile.ubicacion}
                onChange={(e) => setProfile({ ...profile, ubicacion: e.target.value })}
                placeholder="Ej. Chapinero, Bogotá D.C."
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              {profile.ubicacion && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.78rem", color: "#60a5fa", display: "inline-block", marginTop: "4px" }}
                >
                  🗺️ Ver ubicación exacta en Google Maps ↗
                </a>
              )}
            </div>

            {/* Biografía obligatoria */}
            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Biografía *</label>
              <textarea
                rows={3}
                required
                value={profile.biografia}
                onChange={(e) => setProfile({ ...profile, biografia: e.target.value })}
                placeholder="Cuéntale a la comunidad SENA sobre ti y los artículos que ofreces o buscas..."
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>

            <div>
              <label className="muted" style={{ fontSize: "0.85rem" }}>Cambiar Contraseña (opcional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar vacío para mantener la actual"
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" onClick={onClose} className="btn" style={{ opacity: 0.8 }}>
                Cancelar
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Perfil"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}