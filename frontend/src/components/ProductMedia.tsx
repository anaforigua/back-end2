// src/components/ProductMedia.tsx
import React from "react";

interface ProductMediaProps {
  src?: string;
  alt: string;
  height?: number | string;
}

export function ProductMedia({ src, alt, height = "180px" }: ProductMediaProps) {
  const isImage =
    typeof src === "string" &&
    (src.startsWith("data:image") ||
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/"));

  if (isImage) {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          display: "block",
          borderRadius: "12px 12px 0 0",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "3.5rem",
      }}
    >
      {src || "📦"}
    </div>
  );
}