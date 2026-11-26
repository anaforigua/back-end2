import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { UserAvatar } from "./UserAvatar";
import { ProfileModal } from "./modals/ProfileModal";
import { User } from "../types/user";

interface GlobalHeaderProps {
  user: User;
  onLogout: () => void;
  onProfileUpdated: (user: User) => void;
  cartCount: number;
}

export function GlobalHeader({ user, onLogout, onProfileUpdated, cartCount }: GlobalHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const showAdminLink = user.id_roles.includes(1);

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
          <NavLink to="/vendedor"><span className="nav-icon">📦</span><span>Vender</span></NavLink>
          <NavLink to="/comprador"><span className="nav-icon">🛒</span><span>Comprar</span><span className="counter">{cartCount}</span></NavLink>
          <NavLink to="/ambos"><span className="nav-icon">⚖️</span><span>Ambos</span></NavLink>
          {showAdminLink && <NavLink to="/admin"><span className="nav-icon">🛡️</span><span>Admin</span></NavLink>}
        </nav>

        <div className="account">
          <button type="button" onClick={() => setIsProfileOpen(true)} title="Editar perfil" style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", background: "transparent", border: 0, color: "inherit" }}>
            <UserAvatar avatar={user.avatar} alt={user.email} size={36} />
            <span className="user-email">{user.nombre} ✏️</span>
          </button>
          <button className="nav-btn" onClick={onLogout} style={{ transition: "all 0.3s ease", cursor: "pointer" }}>Salir</button>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onUpdated={(updatedUser) => {
          onProfileUpdated(updatedUser);
          setIsProfileOpen(false);
        }}
      />
    </>
  );
}
