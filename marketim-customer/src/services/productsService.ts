import http from "./http";
import { Product, Page } from "../types";

export const getProducts = async (
  categoryId?: number,
  search?: string,
  page: number = 0,
  size: number = 10
): Promise<Page<Product>> => {
  const params: any = { page, size };
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;

  const response = await http.get<Page<Product>>("/api/products", { params });
  return response.data;
};
