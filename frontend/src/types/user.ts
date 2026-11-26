export interface Role {
  id_rol: number;
  nombre_rol?: string;
}

export type UserStatus = "Activo" | "Inactivo" | "Suspendido" | string;

export interface User {
  id_usuarios?: number;
  nombre: string;
  apellidos: string;
  avatar: string;
  biografia: string;
  ubicacion: string;
  email: string;
  calificacion: number;
  estado_usuario: UserStatus;
  id_roles: number[];
  /** Solo se usa en formularios; la API nunca devuelve la contraseña. */
  contrasena?: string;
  productos_publicados?: number;
  productos_comprados?: number;
  productos_vendidos?: number;
}

export type UserCreateInput = Omit<User, "id_usuarios"> & {
  contrasena: string;
};

export type UserUpdateInput = Partial<Omit<User, "id_usuarios">>;
