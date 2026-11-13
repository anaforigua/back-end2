import React from "react";

interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;       // Ruta de la imagen guardada o URL
  imageFile?: File;     // Archivo seleccionado desde el explorador
}

interface ProductCardProps {
  product: Product;
  seller?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onBuy?: () => void;
}

const money = (value: number) => "$" + Number(value).toLocaleString("es-CO");

export function ProductCard({ product, seller, onEdit, onDelete, onBuy }: ProductCardProps) {
  // Generamos la URL temporal si hay un archivo seleccionado, o usamos la imagen existente
  const imageSource = product.imageFile 
    ? URL.createObjectURL(product.imageFile) 
    : product.image;

  return (
    <article className="card product-card">
      <div className="product-img flex items-center justify-center overflow-hidden bg-gray-100">
        {imageSource && (
          <img 
            src={imageSource} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      <div className="product-body">
        <span className="tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <div className="price">{money(product.price)}</div>
        <div className="stock">Stock: <strong>{product.stock}</strong></div>
        {/* En tu ProductCard.tsx */}
<div className="product-img" style={{ width: '100%', height: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' }}>
  {imageSource && (
    <img 
      src={imageSource} 
      alt={product.name} 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  )}
</div>
        {seller ? (
          <div className="actions">
            <button className="btn secondary" onClick={onEdit} style={{ transition: "all 0.2s ease" }}>
              Editar
            </button>
            <button className="btn danger" onClick={onDelete} style={{ transition: "all 0.2s ease" }}>
              Eliminar
            </button>
          </div>
        ) : (
          <div className="actions">
            <button className="btn" onClick={onBuy}>Comprar</button>
          </div>
        )}
      </div>
    </article>
  );
}