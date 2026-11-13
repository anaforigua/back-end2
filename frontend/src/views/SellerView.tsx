import React, { useState } from "react";
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
  image?: string;       // Ruta de la imagen guardada o URL
  imageFile?: File;     // Archivo seleccionado desde el explorador
  [key: string]: any;
}

interface SellerViewProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: number | string) => void;
}

export function SellerView({ products, onAdd, onUpdate, onDelete }: SellerViewProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  const totalStock = products.reduce((sum: number, p: Product) => sum + Number(p.stock), 0);
  const outOfStockCount = products.filter((p: Product) => Number(p.stock) === 0).length;

  // Función para manejar el guardado conectando con el backend mediante FormData
  const handleSaveProduct = async (p: Product) => {
    try {
      // Creamos un FormData para enviar datos y archivos binarios a FastAPI
      const formData = new FormData();
      formData.append("nombre", p.name);
      formData.append("descripcion", p.description || "Sin descripción");
      formData.append("precio", String(Number(p.price)));
      formData.append("cantidad", String(Number(p.stock)));
      formData.append("condicion_producto", "Nuevo");
      formData.append("id_categoria", "1");
      formData.append("estado_producto", Number(p.stock) > 0 ? "Disponible" : "Agotado");
      formData.append("id_pais_de_origen", "1");

      // Si el usuario seleccionó un archivo de imagen en el explorador, lo adjuntamos
      if (p.imageFile) {
        formData.append("file", p.imageFile);
      }

      if (p.id) {
        await productService.update(p.id, formData);
        onUpdate(p);
      } else {
        const response = await productService.create(formData);
        onAdd(response?.data || p);
      }
      setEditing(null);
      alert("¡Producto guardado exitosamente en la base de datos!");
    } catch (error) {
      console.error("Error al guardar el producto en la base de datos:", error);
      alert("Hubo un error al guardar el producto.");
    }
  };

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h1>Panel del vendedor</h1>
          <p>Administra tu catálogo e inventario.</p>
        </div>
        <button
          className="btn"
          onClick={() =>
            setEditing({
              name: "",
              description: "",
              price: 0,
              stock: 0,
              category: "Tecnología",
            })
          }
          style={{ transition: "all 0.3s ease" }}
        >
          + Agregar producto
        </button>
      </div>

      {/* Componente modular integrado */}
      <SellerInventory
        products={products}
        totalStock={totalStock}
        outOfStockCount={outOfStockCount}
        onEdit={(p) => setEditing(p)}
        onDelete={(id) => onDelete(id)}
      />

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