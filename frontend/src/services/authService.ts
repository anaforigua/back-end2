import { request } from "./api";
import { User, UserCreateInput } from "../types/user";
import { mapApiUser } from "./userService";

interface ApiEnvelope<T> {
  data?: T;
  access_token?: string;
  token_type?: string;
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

interface LoginResponse extends ApiEnvelope<ApiUser> {
  access_token?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await request<LoginResponse>("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ email, contrasena: password }),
    });

    if (!response?.access_token || !response.data) {
      throw new Error("El servidor devolvió una respuesta de inicio de sesión incompleta.");
    }

    return { token: response.access_token, user: mapApiUser(response.data) };
  },

  async register(user: UserCreateInput): Promise<User> {
    const response = await request<ApiEnvelope<ApiUser>>("/usuarios/", {
      method: "POST",
      body: JSON.stringify(user),
    });
    if (!response?.data) throw new Error("El servidor no devolvió la cuenta creada.");
    return mapApiUser(response.data);
  },
};
