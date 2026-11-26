import { request } from "./api";

export interface ApiEnvelope<T> {
  data?: T;
}

export interface BackendOrder {
  id_pedido?: number;
  id_pedidos?: number;
  fecha?: string | null;
  estado_pedido?: string;
  tipo_de_pago?: string;
  id_usuarios?: number;
  id_usuario?: number;
  detalles?: Array<{
    cantidad?: number;
    subtotal?: number;
    id_productos?: number;
    producto?: { nombre?: string; precio?: number } | null;
  }>;
}

function unwrap<T>(response: T | ApiEnvelope<T> | null): T | null {
  if (!response) return null;
  if (typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data ?? null;
  }
  return response as T;
}

export const orderService = {
  async getOrders(): Promise<BackendOrder[]> {
    const response = await request<ApiEnvelope<BackendOrder[]> | BackendOrder[]>("/pedidos/");
    const orders = Array.isArray(response) ? response : unwrap(response);
    return Array.isArray(orders) ? orders : [];
  },

  async createOrder(orderData: Record<string, unknown>): Promise<BackendOrder> {
    const response = await request<ApiEnvelope<BackendOrder> | BackendOrder>("/pedidos/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    const created = unwrap(response);
    if (!created) throw new Error("El servidor no devolvió el pedido creado.");
    return created;
  },
};
