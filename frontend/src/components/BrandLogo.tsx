import React from "react";
import logoImg from "../assets/logo-revenfy.png";

interface BrandLogoProps {
  size?: "normal" | "large";
}

export function BrandLogo({ size = "normal" }: BrandLogoProps) {
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
          flexShrink: 0,
        }}
      />
      <span className="logo" style={{ fontSize, letterSpacing: "-0.5px" }}>
        REVEN<span>FY</span>
      </span>
    </div>
  );
}