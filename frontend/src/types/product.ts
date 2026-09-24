export interface Product {
  id?: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  [key: string]: any;
}

export interface CartItem {
  id: number | string;
  qty: number;
}