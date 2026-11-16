// src/services/userService.ts
import { request } from "./api";
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

function getLocalUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  } catch {
    return seedUsers;
  }
}

function saveLocalUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAll(): Promise<User[]> {
    try {
      const data = await request("/usuarios/");
      if (Array.isArray(data)) {
        saveLocalUsers(data);
        return data;
      }
      return getLocalUsers();
    } catch {
      return getLocalUsers();
    }
  },

  async create(user: Omit<User, "id_usuarios">): Promise<User> {
    try {
      return await request("/usuarios/", {
        method: "POST",
        body: JSON.stringify(user),
      });
    } catch {
      const current = getLocalUsers();
      const created: User = { ...user, id_usuarios: Date.now() };
      saveLocalUsers([created, ...current]);
      return created;
    }
  },

  async update(id: number, user: Partial<User>): Promise<User> {
    try {
      return await request(`/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      });
    } catch {
      const current = getLocalUsers();
      let updatedUser = { ...user, id_usuarios: id } as User;
      const next = current.map((u) => {
        if (u.id_usuarios === id) {
          updatedUser = { ...u, ...user };
          return updatedUser;
        }
        return u;
      });
      saveLocalUsers(next);
      return updatedUser;
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await request(`/usuarios/${id}`, {
        method: "DELETE",
      });
    } catch {
      const current = getLocalUsers();
      saveLocalUsers(current.filter((u) => u.id_usuarios !== id));
    }
  },
};