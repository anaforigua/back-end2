import { request } from "./api";

export type OrderInput = Record<string, unknown>;

export const orderService = {
  async getOrders<TOrder = Record<string, unknown>>(): Promise<TOrder[]> {
    const data = await request<TOrder[]>("/orders/");
    return Array.isArray(data) ? data : [];
  },

  async createOrder<TOrder = Record<string, unknown>>(
    orderData: OrderInput
  ): Promise<TOrder | null> {
    return request<TOrder>("/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },
};