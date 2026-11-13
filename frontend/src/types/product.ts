export interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string; // Ruta de la imagen guardada o URL
  imageFile?: File; // Archivo seleccionado desde el explorador
}

export interface CartItem {
  id: number | string;
  qty: number;
}