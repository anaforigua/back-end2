import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Stat } from "../components/Stat";
import { ProductModal } from "../components/modals/ProductModal";
import { SellerInventory } from "../components/SellerInventory";
import { ApiError } from "../services/api";
import { productService } from "../services/productService";
import { Product, ProductId } from "../types/product";

export interface Order {
  id: string;
  date: string;
  units: number;
  total: number;
  status: string;
}

interface BothProductPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  condicion_producto: string;
  id_categoria: number;
  imagenes_producto: string;
  estado_producto: string;
  id_pais_de_origen: number;
  [key: string]: unknown;
}

interface BothProductResponse {
  data?: Partial<Product>;
}

interface BothViewProps {
  products: Product[];
  orders: Order[];
  onAdd?: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (id: ProductId) => void;
  onNotify?: (msg: string) => void;
}

const money = (value: number) => "$" + Number(value || 0).toLocaleString("es-CO");

export function BothView({
  products,
  orders,
  onAdd,
  onUpdate,
  onDelete,
  onNotify,
}: BothViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const sales = orders.reduce((sum: number, o: Order) => sum + Number(o.total || 0), 0);
  const totalStock = products.reduce((sum: number, p) => sum + Number(p.stock || 0), 0);
  const outOfStockCount = products.filter((p) => Number(p.stock || 0) === 0).length;

  const handleSaveProduct = async (p: Product) => {
    const safePrice = Math.max(0, Number(p.price) || 0);
    const safeStock = Math.max(0, Math.floor(Number(p.stock) || 0));
    const mediaValue = p.image || p.emoji || "📦";

    const normalizedProduct: Product = {
      ...p,
      price: safePrice,
      stock: safeStock,
      emoji: mediaValue,
      image: mediaValue,
    };

    const backendData: BothProductPayload = {
      nombre: normalizedProduct.name.trim(),
      descripcion: normalizedProduct.description.trim() || "Sin descripción",
      precio: safePrice,
      cantidad: safeStock,
      condicion_producto: "Nuevo",
      id_categoria: 1,
      imagenes_producto: mediaValue,
      estado_producto: safeStock > 0 ? "Disponible" : "Agotado",
      id_pais_de_origen: 1,
    };

    try {
      if (normalizedProduct.id !== undefined) {
        await productService.update(normalizedProduct.id, backendData);
        onUpdate?.(normalizedProduct);
      } else {
        const response = await productService.create<BothProductResponse>(backendData);
        onAdd?.(
          response?.data ? { ...normalizedProduct, ...response.data } : normalizedProduct
        );
      }
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiError) {
        onNotify?.(error.message);
        return;
      }

      if (normalizedProduct.id !== undefined) {
        onUpdate?.(normalizedProduct);
      } else {
        onAdd?.(normalizedProduct);
      }
      setEditing(null);
    }
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Mi espacio</h1>
          <p>Compra y vende usando la misma cuenta.</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setEditing({
              name: "",
              description: "",
              price: 0,
              stock: 1,
              category: "Tecnología",
              emoji: "📦",
            })
          }
        >
          + Publicar producto
        </button>
      </div>

      <div className="stats">
        <Stat label="Productos en catálogo" value={products.length} />
        <Stat label="Pedidos realizados" value={orders.length} />
        <Stat label="Valor de ventas" value={money(sales)} />
      </div>

      <div className="two-panels">
        <div className="card">
          <h2>Acciones rápidas</h2>
          <p className="muted">Accede directamente a las funciones principales.</p>
          <div className="actions">
            <NavLink to="/vendedor" className="btn">Ir a Vendedor</NavLink>
            <NavLink to="/comprador" className="btn secondary">Ir a Comprador</NavLink>
          </div>
        </div>
        <div className="card">
          <h2>Video de referencia</h2>
          <video className="video" controls preload="metadata">
            <source src="/assets/demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>Mis productos publicados</h2>
        <SellerInventory
          products={products}
          totalStock={totalStock}
          outOfStockCount={outOfStockCount}
          onEdit={(p) => setEditing(p)}
          onDelete={(id) => onDelete?.(id)}
        />
      </div>

      <div className="card orders">
        <h2>Historial de pedidos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Unidades</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: Order) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.units}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span className="tag">{o.status}</span>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={5} className="empty">Aún no hay pedidos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveProduct}
        />
      )}
    </main>
  );
}