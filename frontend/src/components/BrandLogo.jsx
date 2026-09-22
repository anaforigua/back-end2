import React from "react";
import logoImg from "../assets/logo-revenfy.png"; // Asegúrate de que la ruta apunte a donde guardaste la imagen

export function BrandLogo({ size = "normal" }) {
  // Tamaños adaptativos según el espacio (login o barra de navegación)
  const isLarge = size === "large";
  
  const imgSize = isLarge ? "56px" : "36px";
  const fontSize = isLarge ? "26px" : "20px";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <img 
        src={logoImg} 
        alt="Revenfy Logo" 
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(233, 139, 255, 0.4)",
          boxShadow: "0 0 12px rgba(112, 71, 239, 0.4)",
          flexShrink: 0
        }}
      />
      <span className="logo" style={{ fontSize: fontSize, letterSpacing: "-0.5px" }}>
        REVEN<span>FY</span>
      </span>
    </div>
  );
}