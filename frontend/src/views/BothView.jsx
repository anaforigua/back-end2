import React from "react";
import { NavLink } from "react-router-dom";
import { Stat } from "../components/Stat";

const money = value => "$" + Number(value).toLocaleString("es-CO");

export function BothView({ products, orders }) {
  const sales = orders.reduce((sum, o) => sum + o.total, 0);
  return (
    <main className="page">
      <div className="page-title"><div><h1>Mi espacio</h1><p>Compra y vende usando la misma cuenta.</p></div></div>
      <div className="stats"><Stat label="Productos en catálogo" value={products.length}/><Stat label="Pedidos realizados" value={orders.length}/><Stat label="Valor de compras" value={money(sales)}/></div>
      <div className="two-panels">
        <div className="card"><h2>Acciones rápidas</h2><p className="muted">Accede directamente a las funciones principales.</p><div className="actions"><NavLink className="btn" to="/vendedor">Administrar productos</NavLink><NavLink className="btn secondary" to="/comprador">Explorar catálogo</NavLink></div></div>
        <div className="card"><h2>Video de referencia</h2><video className="video" controls preload="metadata"><source src="/assets/demo.mp4" type="video/mp4"/></video></div>
      </div>
      <div className="card orders">
        <h2>Historial de pedidos</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Fecha</th><th>Unidades</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.date}</td><td>{o.units}</td><td>{money(o.total)}</td><td><span className="tag">{o.status}</span></td></tr>)}
              {!orders.length && <tr><td colSpan="5" className="empty">Aún no hay pedidos.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}