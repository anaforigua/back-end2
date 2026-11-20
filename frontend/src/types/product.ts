export type ProductId = number | string;

export interface Product {
  id?: ProductId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  image?: string;
  imageUrl?: string;
  sellerId?: number | string;
}

export interface ProductCreateInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  emoji?: string;
  image?: string;
  imageUrl?: string;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface CartItem {
  id: ProductId;
  qty: number;
}