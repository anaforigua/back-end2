import React from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

export function GlobalHeader({ email, onLogout, cartCount }) {
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
        <button 
          className="nav-btn" 
          onClick={onLogout}
          style={{
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(112, 71, 239, 0.25)";
            e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.6)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(112, 71, 239, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Salir ↪
        </button>
      </div>
    </header>
  );
}