// src/components/GlobalHeader.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { UserAvatar } from "./UserAvatar";
import { ProfileModal } from "./modals/ProfileModal";
import { getOrCreateUserProfile } from "../utils/avatarHelper";
import { isAdminEmail } from "../views/RolesView";
import { User } from "../types/user";

interface GlobalHeaderProps {
  email: string;
  onLogout: () => void;
  cartCount: number;
}

export function GlobalHeader({ email, onLogout, cartCount }: GlobalHeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!email) return;
    getOrCreateUserProfile(email).then((u) => setCurrentUser(u));
  }, [email]);

  const showAdminLink = isAdminEmail(email);

  return (
    <>
      <header className="bottom-nav">
        <div className="bottom-brand">
          <NavLink to="/roles" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <BrandLogo size="normal" />
          </NavLink>
          <span className="brand-caption">Tu marketplace, tus reglas</span>
        </div>

        <nav className="nav">
          <NavLink to="/vendedor">
            <span className="nav-icon">📦</span>
            <span>Vender</span>
          </NavLink>
          <NavLink to="/comprador">
            <span className="nav-icon">🛒</span>
            <span>Comprar</span>
            <span className="counter">{cartCount}</span>
          </NavLink>
          <NavLink to="/ambos">
            <span className="nav-icon">⚖️</span>
            <span>Ambos</span>
          </NavLink>
          {showAdminLink && (
            <NavLink to="/admin">
              <span className="nav-icon">🛡️</span>
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="account">
          <div
            onClick={() => setIsProfileOpen(true)}
            title="Haz clic para editar tu perfil y foto"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <UserAvatar avatar={currentUser?.avatar} alt={email} size={36} />
            <span className="user-email">
              {currentUser?.nombre ? `${currentUser.nombre}` : email} ✏️
            </span>
          </div>

          <button
            className="nav-btn"
            onClick={onLogout}
            style={{ transition: "all 0.3s ease", cursor: "pointer" }}
          >
            Salir
          </button>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        email={email}
        onClose={() => setIsProfileOpen(false)}
        onUpdated={(updatedUser) => setCurrentUser(updatedUser)}
      />
    </>
  );
}