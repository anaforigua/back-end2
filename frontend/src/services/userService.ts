import { ApiError, request } from "./api";
import { User } from "../types/user";

const STORAGE_KEY = "revenfy_users";

const seedUsers: User[] = [
  {
    id_usuarios: 1,
    nombre: "Anamaria",
    apellidos: "Forigua Murcia",
    avatar: "🛡️",
    biografia: "Administradora general de la plataforma Revenfy SENA.",
    ubicacion: "Bogotá D.C.",
    email: "admin@revenfy.com",
    calificacion: 5.0,
    estado_usuario: "Activo",
    id_roles: [1, 2, 3],
  },
  {
    id_usuarios: 2,
    nombre: "Julián Esteban",
    apellidos: "Murillo Mena",
    avatar: "👨‍💻",
    biografia: "Aprendiz ADSO - Vendedor de tecnología y accesorios.",
    ubicacion: "Bogotá D.C.",
    email: "julian.murillo@misena.edu.co",
    calificacion: 4.9,
    estado_usuario: "Activo",
    id_roles: [2, 3],
  },
];

function isNetworkFallbackError(error: unknown): boolean {
  return !(error instanceof ApiError);
}

function getLocalUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as User[]) : seedUsers;
  } catch {
    return seedUsers;
  }
}

function saveLocalUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Evita romper el flujo si el almacenamiento del navegador está lleno o bloqueado
  }
}

export const userService = {
  async getAll(): Promise<User[]> {
    try {
      const data = await request<User[]>("/usuarios/");
      if (Array.isArray(data)) {
        saveLocalUsers(data);
        return data;
      }
      return getLocalUsers();
    } catch (error) {
      if (isNetworkFallbackError(error)) {
        return getLocalUsers();
      }
      throw error;
    }
  },

  async create(user: Omit<User, "id_usuarios">): Promise<User> {
    try {
      const created = await request<User>("/usuarios/", {
        method: "POST",
        body: JSON.stringify(user),
      });
      if (created) return created;
      throw new ApiError("Respuesta vacía al crear usuario.", 500);
    } catch (error) {
      if (isNetworkFallbackError(error)) {
        const current = getLocalUsers();
        const created: User = { ...user, id_usuarios: Date.now() };
        saveLocalUsers([created, ...current]);
        return created;
      }
      throw error;
    }
  },

  async update(id: number, user: Partial<User>): Promise<User> {
    const safeId = encodeURIComponent(String(id));
    try {
      const updated = await request<User>(`/usuarios/${safeId}`, {
        method: "PUT",
        body: JSON.stringify(user),
      });
      if (updated) return updated;
      throw new ApiError("Respuesta vacía al actualizar usuario.", 500);
    } catch (error) {
      if (isNetworkFallbackError(error)) {
        const current = getLocalUsers();
        let updatedUser: User | null = null;
        const next = current.map((u) => {
          if (u.id_usuarios === id) {
            updatedUser = { ...u, ...user };
            return updatedUser;
          }
          return u;
        });
        saveLocalUsers(next);
        return updatedUser ?? ({ ...user, id_usuarios: id } as User);
      }
      throw error;
    }
  },

  async remove(id: number): Promise<void> {
    const safeId = encodeURIComponent(String(id));
    try {
      await request<void>(`/usuarios/${safeId}`, {
        method: "DELETE",
      });
    } catch (error) {
      if (isNetworkFallbackError(error)) {
        const current = getLocalUsers();
        saveLocalUsers(current.filter((u) => u.id_usuarios !== id));
        return;
      }
      throw error;
    }
  },
};