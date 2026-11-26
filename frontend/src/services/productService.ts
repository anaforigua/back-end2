import { request } from "./api";
import { Product, ProductId } from "../types/product";

interface ApiEnvelope<T> {
  data?: T;
}

interface ApiProduct {
  id_producto?: number | string | null;
  id_productos?: number | string | null;
  nombre_producto?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  precio?: number | string | null;
  cantidad?: number | string | null;
  id_categoria?: number | null;
  categoria?: { nombre_categoria?: string | null } | null;
  imagenes_producto?: string | null;
  estado_producto?: string | null;
  [key: string]: unknown;
}

function unwrap<T>(response: T | ApiEnvelope<T> | null): T | null {
  if (!response) return null;
  if (typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data ?? null;
  }
  return response as T;
}

export function mapApiProduct(raw: ApiProduct): Product {
  const id = raw.id_productos ?? raw.id_producto;
  const media = raw.imagenes_producto?.trim() || "";
  return {
    id: id ?? undefined,
    name: String(raw.nombre ?? raw.nombre_producto ?? "Producto"),
    description: String(raw.descripcion ?? ""),
    price: Number(raw.precio ?? 0),
    stock: Number(raw.cantidad ?? 0),
    category: String(raw.categoria?.nombre_categoria ?? "Otros"),
    image: media,
    emoji: "📦",
    ...raw,
  } as Product;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await request<ApiEnvelope<ApiProduct[]> | ApiProduct[]>("/productos/");
    const records = Array.isArray(response)
      ? response
      : unwrap(response as ApiEnvelope<ApiProduct[]> | null);
    return Array.isArray(records) ? records.map(mapApiProduct) : [];
  },

  async create(product: Record<string, unknown>): Promise<Product> {
    const response = await request<ApiEnvelope<ApiProduct> | ApiProduct>("/productos/", {
      method: "POST",
      body: JSON.stringify(product),
    });
    const created = unwrap(response);
    if (!created) throw new Error("El servidor no devolvió el producto creado.");
    return mapApiProduct(created);
  },

  async update(id: ProductId, product: Record<string, unknown>): Promise<Product> {
    const safeId = encodeURIComponent(String(id));
    const response = await request<ApiEnvelope<ApiProduct> | ApiProduct>(`/productos/${safeId}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    const updated = unwrap(response);
    if (!updated) throw new Error("El servidor no devolvió el producto actualizado.");
    return mapApiProduct(updated);
  },

  async delete(id: ProductId): Promise<void> {
    const safeId = encodeURIComponent(String(id));
    await request<ApiEnvelope<unknown>>(`/productos/${safeId}`, {
      method: "DELETE",
    });
  },
};
