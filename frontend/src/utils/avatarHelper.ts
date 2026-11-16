// src/utils/avatarHelper.ts
import { User } from "../types/user";
import { userService } from "../services/userService";

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Por favor selecciona una imagen válida (JPG, PNG, WEBP)."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
      img.src = String(event.target?.result || "");
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export async function getOrCreateUserProfile(email: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const users = await userService.getAll();
  const existing = users.find((u) => u.email.trim().toLowerCase() === normalized);

  if (existing) {
    return existing;
  }

  return await userService.create({
    nombre: email.split("@")[0] || "Usuario",
    apellidos: "Revenfy",
    avatar: "👤",
    biografia: "",
    ubicacion: "Bogotá D.C.",
    email,
    calificacion: 5.0,
    estado_usuario: "Activo",
    id_roles: [2, 3],
  });
}