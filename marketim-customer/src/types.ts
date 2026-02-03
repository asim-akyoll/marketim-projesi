export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  unitLabel?: string;
  active: boolean;
  categoryId: number;
  categoryName: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CartItem extends Product {
  quantity: number;
}
