// src/components/modals/ProfileModal.tsx
import React, { useState, useEffect } from "react";
import { User } from "../../types/user";
import { userService } from "../../services/userService";
import { UserAvatar } from "../UserAvatar";
import { compressImageFile } from "../../utils/avatarHelper";
import { getRealTimeLocation } from "../../utils/locationHelper";

interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdated: (updatedUser: User) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #283566",
  backgroundColor: "#162044",
  color: "#f8fafc",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "#a5b4fc",
  marginBottom: "6px",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "7px 13px",
  borderRadius: "10px",
  border: "1px solid #37437a",
  backgroundColor: "#1b2652",
  color: "#e0e7ff",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

export function ProfileModal({ isOpen, user, onClose, onUpdated }: ProfileModalProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setPassword("");
    setProfile(user);
    setLoading(false);
  }, [isOpen, user]);

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
        biografia: profile.biografia.trim(),
        ubicacion: profile.ubicacion,
        email: profile.email,
        calificacion: profile.calificacion,
        estado_usuario: profile.estado_usuario,
        avatar: profile.avatar,
      };

      if (password.trim()) {
        payload.contrasena = password.trim();
      }

      if (profile.id_usuarios === undefined) {
        throw new Error("El perfil no tiene un identificador válido.");
      }
      const saved = await userService.update(profile.id_usuarios, payload);

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
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(6, 10, 28, 0.82)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#0e1532",
          border: "1px solid #263366",
          borderRadius: "18px",
          boxShadow: "0 24px 50px rgba(0, 0, 0, 0.65)",
          padding: "24px",
          color: "#f8fafc",
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "14px",
            marginBottom: "18px",
            borderBottom: "1px solid #1f2b57",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
              Mi Perfil en{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Revenfy
              </span>
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
              Personaliza tu identidad y ubicación en la comunidad SENA
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#162044",
              border: "1px solid #283566",
              color: "#a5b4fc",
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            ✕
          </button>
        </div>

        {loading || !profile ? (
          <p style={{ color: "#a5b4fc", textAlign: "center", padding: "24px 0" }}>
            Cargando información de tu perfil...
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
            {/* Tarjeta de Foto de Perfil */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 14px",
                backgroundColor: "#131c3f",
                borderRadius: "14px",
                border: "1px solid #243060",
              }}
            >
              <UserAvatar avatar={profile.avatar} alt={profile.nombre} size={64} />
              <div style={{ flex: 1 }}>
                <span style={{ ...labelStyle, color: "#e0e7ff", marginBottom: "8px" }}>
                  Foto de Perfil
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <label style={secondaryBtnStyle}>
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
                      style={{
                        ...secondaryBtnStyle,
                        backgroundColor: "rgba(239, 68, 68, 0.12)",
                        borderColor: "rgba(239, 68, 68, 0.35)",
                        color: "#fca5a5",
                      }}
                      onClick={() => setProfile({ ...profile, avatar: "👤" })}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>URL pública del avatar (opcional)</label>
              <input
                type="url"
                value={profile.avatar?.startsWith("http") ? profile.avatar : ""}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value || "👤" })}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            {/* Nombre y Apellidos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  type="text"
                  required
                  value={profile.nombre}
                  onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Apellidos *</label>
                <input
                  type="text"
                  required
                  value={profile.apellidos}
                  onChange={(e) => setProfile({ ...profile, apellidos: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input
                type="email"
                disabled
                value={profile.email}
                style={{
                  ...inputStyle,
                  backgroundColor: "#0b1026",
                  color: "#64748b",
                  borderColor: "#1d274f",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* Ubicación en tiempo real */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>Ubicación en Tiempo Real *</label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  style={{
                    ...secondaryBtnStyle,
                    padding: "4px 10px",
                    fontSize: "0.76rem",
                    backgroundColor: "rgba(139, 92, 246, 0.16)",
                    borderColor: "rgba(168, 85, 247, 0.45)",
                    color: "#d8b4fe",
                  }}
                >
                  {locating ? "⏳ Detectando..." : "📍 Usar mi ubicación actual"}
                </button>
              </div>
              <input
                type="text"
                required
                value={profile.ubicacion}
                onChange={(e) => setProfile({ ...profile, ubicacion: e.target.value })}
                placeholder="Ej. Chapinero, Bogotá D.C."
                style={inputStyle}
              />
              {profile.ubicacion && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.78rem",
                    color: "#c084fc",
                    textDecoration: "none",
                    display: "inline-block",
                    marginTop: "6px",
                  }}
                >
                  🗺️ Ver ubicación exacta en Google Maps ↗
                </a>
              )}
            </div>

            {/* Biografía obligatoria */}
            <div>
              <label style={labelStyle}>Biografía *</label>
              <textarea
                rows={3}
                required
                value={profile.biografia}
                onChange={(e) => setProfile({ ...profile, biografia: e.target.value })}
                placeholder="Cuéntale a la comunidad SENA sobre ti y los artículos que ofreces o buscas..."
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={labelStyle}>Cambiar Contraseña (opcional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar vacío para mantener la actual"
                style={inputStyle}
              />
            </div>

            {/* Acciones finales */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "6px",
                paddingTop: "14px",
                borderTop: "1px solid #1f2b57",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  ...secondaryBtnStyle,
                  padding: "10px 18px",
                  fontSize: "0.88rem",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(168, 85, 247, 0.35)",
                }}
              >
                {saving ? "Guardando..." : "Guardar Perfil"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
