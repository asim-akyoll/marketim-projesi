import http from "./http";

import type { Category } from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const response = await http.get<Category[]>("/api/categories");
  return response.data;
};
