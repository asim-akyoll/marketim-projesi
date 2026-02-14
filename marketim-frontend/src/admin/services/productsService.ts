import http from "./http";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type ProductResponse = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  unitLabel?: string | null;
  barcode?: string | null;
  active: boolean;
  categoryId?: number | null;
  categoryName?: string | null;
};

export type ProductsQuery = {
  page?: number;
  size?: number;
  active?: boolean;
  categoryId?: number;
  q?: string;
  sort?: string; // "id,desc"
};

export async function getAdminProducts(
  query: ProductsQuery = {}
): Promise<PageResponse<ProductResponse>> {
  const { data } = await http.get<PageResponse<ProductResponse>>(
    "/api/admin/products",
    {
      params: {
        page: query.page ?? 0,
        size: query.size ?? 200,
        active: query.active,
        categoryId: query.categoryId,
        search: query.q,
        sort: query.sort ?? "id,desc",
      },
    }
  );
  return data;
}

export async function getAdminLowStockProducts(params: {
  threshold?: number;
  page?: number;
  size?: number;
}): Promise<PageResponse<ProductResponse>> {
  const { data } = await http.get<PageResponse<ProductResponse>>(
    "/api/admin/products/low-stock",
    {
      params: {
        threshold: params.threshold ?? 10, // UI: kritik seviye 10
        page: params.page ?? 0,
        size: params.size ?? 200,
      },
    }
  );
  return data;
}

export type ProductRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  stock: number;
  categoryId: number;
  unitLabel?: string | null;
};

export async function createAdminProduct(
  payload: ProductRequest
): Promise<ProductResponse> {
  const { data } = await http.post<ProductResponse>(
    "/api/admin/products",
    payload
  );
  return data;
}

export async function updateAdminProduct(
  id: number,
  payload: ProductRequest
): Promise<ProductResponse> {
  const { data } = await http.put<ProductResponse>(
    `/api/admin/products/${id}`,
    payload
  );
  return data;
}
