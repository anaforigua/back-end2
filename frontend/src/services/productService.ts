import { request } from "./api";

export const productService = {
  async getAll() {
    return request("/productos/");
  },
  async create(product: Record<string, any>) {
    return request("/productos/", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },
  async update(id: string | number, product: Record<string, any>) {
    return request(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },
  async delete(id: string | number) {
    return request(`/productos/${id}`, {
      method: "DELETE",
    });
  },
};