import { request } from "./api";

export const orderService = {
  async getOrders() {
    return request("/orders/");
  },
  async createOrder(orderData: Record<string, any>) {
    return request("/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },
};