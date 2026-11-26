import { request } from "./api";
import { User, UserCreateInput, UserUpdateInput } from "../types/user";

interface ApiEnvelope<T> {
  data?: T;
}

interface ApiUser {
  id_usuarios: number;
  nombre: string;
  apellidos: string;
  avatar: string;
  biografia: string;
  ubicacion: string;
  email: string;
  calificacion: number;
  estado_usuario: string;
  roles?: Array<{ id_rol: number; nombre_rol?: string }>;
  id_roles?: number[];
}

export function mapApiUser(record: ApiUser): User {
  const roleIds = Array.isArray(record.id_roles)
    ? record.id_roles
    : (record.roles ?? []).map((role) => role.id_rol);
  return { ...record, id_roles: roleIds };
}

function unwrap<T>(response: T | ApiEnvelope<T> | null): T | null {
  if (!response) return null;
  if (typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data ?? null;
  }
  return response as T;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await request<ApiEnvelope<ApiUser[]> | ApiUser[]>("/usuarios/");
    const users = Array.isArray(response) ? response : unwrap(response);
    return Array.isArray(users) ? users.map(mapApiUser) : [];
  },

  async getById(id: number): Promise<User> {
    const response = await request<ApiEnvelope<ApiUser> | ApiUser>(`/usuarios/${encodeURIComponent(String(id))}`);
    const user = unwrap(response);
    if (!user) throw new Error("El servidor no devolvió el perfil.");
    return mapApiUser(user);
  },

  async create(user: UserCreateInput): Promise<User> {
    const response = await request<ApiEnvelope<ApiUser> | ApiUser>("/usuarios/", {
      method: "POST",
      body: JSON.stringify(user),
    });
    const created = unwrap(response);
    if (!created) throw new Error("El servidor no devolvió el usuario creado.");
    return mapApiUser(created);
  },

  async update(id: number, user: UserUpdateInput): Promise<User> {
    const response = await request<ApiEnvelope<ApiUser> | ApiUser>(`/usuarios/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
    const updated = unwrap(response);
    if (!updated) throw new Error("El servidor no devolvió el usuario actualizado.");
    return mapApiUser(updated);
  },

  async remove(id: number): Promise<void> {
    await request<ApiEnvelope<unknown>>(`/usuarios/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    });
  },
};
