import React from "react";
import { NavLink } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

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
        <RoleCard to="/vendedor" icon="🏪" title="Vendedor"
          text="Publica productos, controla inventario y gestiona tus ventas."
          button="Quiero Vender" />
        <RoleCard to="/comprador" icon="🛍️" title="Comprador"
          text="Explora productos, filtra, agrega al carrito y compra."
          button="Quiero Comprar" recommended />
        <RoleCard to="/ambos" icon="🔄" title="Vendedor + Comprador"
          text="Accede a las funciones de compra y venta desde la misma cuenta."
          button="Quiero Todo" />
      </div>
    </main>
  );
}

function RoleCard({ to, icon, title, text, button, recommended }) {
  return (
    <NavLink 
      to={to} 
      className={`card role-card ${recommended ? "recommended" : ""}`}
      style={{
        transition: "all 0.35s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(233, 139, 255, 0.7)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(112, 71, 239, 0.35), inset 0 0 15px rgba(112, 71, 239, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {recommended && <div className="recommended-badge">✨ MÁS RECOMENDADO</div>}
      <div className="role-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <div 
        className="role-action"
        style={{ 
          transition: "all 0.3s ease" 
        }}
        onMouseEnter={(e) => {
          // Forzamos el fondo con el degradado y un brillo neón interno al hacer hover
          e.currentTarget.style.background = "linear-gradient(135deg, #7047ef 0%, #e98bff 100%)";
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.boxShadow = "0 0 15px rgba(112, 71, 239, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "";
          e.currentTarget.style.color = "";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {button}<span>→</span>
      </div>
    </NavLink>
  );
}