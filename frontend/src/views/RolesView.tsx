// src/views/RolesView.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

export const ADMIN_EMAILS = [
  "admin@revenfy.com",
  "anamariaforigua20@gmail.com",
  "anamaria.forigua@misena.edu.co",
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

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

interface RolesViewProps {
  email?: string;
}

export function RolesView({ email = "" }: RolesViewProps) {
  const currentEmail = email || localStorage.getItem("revenfy_email") || "";
  const canAccessAdmin = isAdminEmail(currentEmail);

  return (
    <main className="role-page">
      <div className="role-heading">
        <div
          className="role-brand-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            width: "max-content",
            margin: "0 auto 25px",
          }}
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
        {canAccessAdmin && (
          <RoleCard
            to="/admin"
            icon="🛡️"
            title="Administrador"
            text="Gestiona usuarios, roles, estados y el CRUD completo del catálogo."
            button="Panel Admin"
          />
        )}
      </div>
    </main>
  );
}