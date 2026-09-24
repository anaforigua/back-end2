import React from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

interface RoleCardProps {
  to: string;
  icon: string;
  title: string;
  text: string;
  button: string;
  recommended?: boolean;
}

function RoleCard({ to, icon, title, text, button, recommended }: RoleCardProps) {
  return (
    <NavLink
      to={to}
      className={`card role-card ${recommended ? "recommended" : ""}`}
      style={{
        transition: "all 0.35s ease",
        textDecoration: "none",
      }}
    >
      <div className="role-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      <span className="btn">{button}</span>
    </NavLink>
  );
}

export function RolesView() {
  return (
    <main className="role-page">
      <div className="role-heading">
        <div
          className="role-brand-pill"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", width: "max-content", margin: "0 auto 25px" }}
        >
          <BrandLogo size="normal" />
        </div>
        <h1>¿Cómo quieres usar <span>Revenfy</span>?</h1>
        <p>Selecciona el rol que necesitas para continuar.</p>
      </div>

      <div className="role-grid">
        <RoleCard
          to="/vendedor"
          icon="📦"
          title="Vendedor"
          text="Publica productos, controla inventario y gestiona tus ventas."
          button="Quiero Vender"
        />
        <RoleCard
          to="/comprador"
          icon="🛒"
          title="Comprador"
          text="Explora productos, filtra, agrega al carrito y compra."
          button="Quiero Comprar"
          recommended
        />
        <RoleCard
          to="/ambos"
          icon="⚖️"
          title="Vendedor + Comprador"
          text="Accede a las funciones de compra y venta desde la misma cuenta."
          button="Quiero Todo"
        />
      </div>
    </main>
  );
}