import { request } from "./api";

export type ProductInput = Record<string, unknown>;

export const productService = {
  async getAll<TProduct = Record<string, unknown>>(): Promise<TProduct[]> {
    const data = await request<TProduct[]>("/productos/");
    return Array.isArray(data) ? data : [];
  },

  async create<TProduct = Record<string, unknown>>(
    product: ProductInput
  ): Promise<TProduct | null> {
    return request<TProduct>("/productos/", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },

  async update<TProduct = Record<string, unknown>>(
    id: string | number,
    product: ProductInput
  ): Promise<TProduct | null> {
    const safeId = encodeURIComponent(String(id));
    return request<TProduct>(`/productos/${safeId}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },

  async delete(id: string | number): Promise<void> {
    const safeId = encodeURIComponent(String(id));
    await request<void>(`/productos/${safeId}`, {
      method: "DELETE",
    });
  },
};