// src/types/user.ts
export interface Role {
  id_rol: number;
  nombre_rol?: string;
}

export interface User {
  id_usuarios?: number;
  nombre: string;
  apellidos: string;
  contrasena?: string;
  avatar: string;
  biografia: string;
  ubicacion: string;
  email: string;
  calificacion: number;
  estado_usuario: string;
  id_roles: number[];
}