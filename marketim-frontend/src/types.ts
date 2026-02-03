// CATEGORY
export interface Category {
  id: number;
  name: string;
  active: boolean;
}

// PRODUCT
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  category: Category;
  active: boolean;
  unitLabel?: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// PAGINATION
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
