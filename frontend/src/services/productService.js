import { request } from "./api";

export const productService = {
  async getAll() {
    return request("/products/");
  },
  async create(product) {
    return request("/products/", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },
  async update(id, product) {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },
  async delete(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  }
};