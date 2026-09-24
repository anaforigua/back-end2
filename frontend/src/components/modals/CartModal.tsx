import React from "react";

interface CartItem {
  id: number | string;
  qty: number;
}

interface Product {
  id?: number | string; // <-- Cambiado a opcional (?) para evitar conflictos
  name: string;
  price: number;
  [key: string]: any;
}

interface CartModalProps {
  cart: CartItem[];
  products: Product[];
  total: number;
  onChangeQty: (id: number | string, delta: number) => void;
  onClose: () => void;
  onCheckout: () => void;
}

const money = (value: number) => "$" + Number(value).toLocaleString("es-CO");

export function CartModal({ cart, products, total, onChangeQty, onClose, onCheckout }: CartModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal wide">
        <div className="modal-head">
          <h2>Tu carrito</h2>
          <button onClick={onClose} className="x">✕</button>
        </div>
        {!cart.length ? (
          <div className="empty">Tu carrito está vacío.</div>
        ) : (
          <>
            {cart.map(item => {
              const p = products.find(x => x.id === item.id);
              if (!p) return null;
              return (
                <div className="cart-row" key={item.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <span className="muted">{money(p.price)} x {item.qty}</span>
                  </div>
                  <div className="actions">
                    <button className="qty" onClick={() => onChangeQty(p.id!, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="qty" onClick={() => onChangeQty(p.id!, 1)}>+</button>
                  </div>
                </div>
              );
            })}
            <div className="total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="actions">
              <button className="btn secondary" onClick={onClose}>Cerrar</button>
              <button className="btn" onClick={onCheckout}>Confirmar compra</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}