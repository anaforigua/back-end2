// src/views/BothView.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Stat } from "../components/Stat";
import { ProductModal } from "../components/modals/ProductModal";
import { SellerInventory } from "../components/SellerInventory";
import { productService } from "../services/productService";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  image?: string;
  [key: string]: any;
}

interface Order {
  id: string;
  date: string;
  units: number;
  total: number;
  status: string;
}

interface BothViewProps {
  products: Product[];
  orders: Order[];
  onAdd?: (product: Product) => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (id: number | string) => void;
}

const money = (value: number) => "$" + Number(value).toLocaleString("es-CO");

export function BothView({ products, orders, onAdd, onUpdate, onDelete }: BothViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const sales = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
  const totalStock = products.reduce((sum: number, p: Product) => sum + Number(p.stock), 0);
  const outOfStockCount = products.filter((p: Product) => Number(p.stock) === 0).length;

  const handleSaveProduct = async (p: Product) => {
    try {
      const backendData = {
        nombre: p.name,
        descripcion: p.description || "Sin descripción",
        precio: Number(p.price),
        cantidad: Number(p.stock),
        condicion_producto: "Nuevo",
        id_categoria: 1,
        imagenes_producto: p.image || p.emoji || "📦",
        estado_producto: Number(p.stock) > 0 ? "Disponible" : "Agotado",
        id_pais_de_origen: 1,
      };

      if (p.id) {
        await productService.update(p.id, backendData);
        onUpdate?.(p);
      } else {
        const response = await productService.create(backendData);
        onAdd?.(response?.data ? { ...p, ...response.data } : p);
      }
      setEditing(null);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      if (p.id) {
        onUpdate?.(p);
      } else {
        onAdd?.(p);
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

      {/* Mis productos publicados con foto desde dispositivo */}
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