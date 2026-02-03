import http from "./http";
import type { Product, Page } from "../types";

export const getProducts = async (
  categoryId?: number,
  search?: string,
  page: number = 0,
  size: number = 10,
  sort?: string
): Promise<Page<Product>> => {
  const params: any = { page, size };

  if (categoryId) params.categoryId = categoryId;
  if (sort) params.sort = sort;

  if (search && search.trim().length > 0) {
    const s = search.trim();
    params.search = s;
    params.q = s;
    params.query = s;
  }

  const response = await http.get<Page<Product>>("/api/products", { params });
  return response.data;
};
