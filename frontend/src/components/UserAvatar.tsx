// src/components/UserAvatar.tsx
import React from "react";

interface UserAvatarProps {
  avatar?: string;
  alt?: string;
  size?: number;
}

export function UserAvatar({ avatar, alt = "Avatar", size = 40 }: UserAvatarProps) {
  const isImage =
    typeof avatar === "string" &&
    (avatar.startsWith("data:image") || avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/"));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1e293b",
        border: "2px solid #3b82f6",
        flexShrink: 0,
        fontSize: `${Math.round(size * 0.55)}px`,
      }}
    >
      {isImage ? (
        <img
          src={avatar}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <span>{avatar || "👤"}</span>
      )}
    </div>
  );
}