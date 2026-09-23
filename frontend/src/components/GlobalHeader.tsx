import React from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

interface GlobalHeaderProps {
  email: string;
  onLogout: () => void;
  cartCount: number;
}

export function GlobalHeader({ email, onLogout, cartCount }: GlobalHeaderProps) {
  return (
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
      </nav>

      <div className="account">
        <div className="avatar">👤</div>
        <span className="user-email">{email}</span>
        <button
          className="nav-btn"
          onClick={onLogout}
          style={{ transition: "all 0.3s ease", cursor: "pointer" }}
        >
          Salir
        </button>
      </div>
    </header>
  );
}