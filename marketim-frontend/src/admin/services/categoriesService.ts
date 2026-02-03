import http from "./http";

export type CategoryResponse = {
  id: number;
  name: string;
  active: boolean;
};

export async function getActiveCategories(): Promise<CategoryResponse[]> {
  const { data } = await http.get<CategoryResponse[]>("/api/categories");
  return data;
}
