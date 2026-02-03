import http from "./http";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type CategoryResponse = {
  id: number;
  name: string;
  active: boolean;
};

export type CategoryAdminListResponse = PageResponse<CategoryResponse>;

export type CategoriesQuery = {
  page?: number;
  size?: number;
  q?: string;
  active?: boolean;
  sort?: string; // "id"
  dir?: "asc" | "desc";
};

export type CategoryRequest = {
  name: string;
};

export async function getAdminCategories(
  query: CategoriesQuery = {}
): Promise<CategoryAdminListResponse> {
  const { data } = await http.get<CategoryAdminListResponse>(
    "/api/admin/categories",
    {
      params: {
        page: query.page ?? 0,
        size: query.size ?? 200,
        q: query.q,
        active: query.active,
        sort: query.sort ?? "id",
        dir: query.dir ?? "desc",
      },
    }
  );
  return data;
}

export async function createAdminCategory(
  payload: CategoryRequest
): Promise<CategoryResponse> {
  const { data } = await http.post<CategoryResponse>(
    "/api/admin/categories",
    payload
  );
  return data;
}

export async function updateAdminCategory(
  id: number,
  payload: CategoryRequest
): Promise<CategoryResponse> {
  const { data } = await http.put<CategoryResponse>(
    `/api/admin/categories/${id}`,
    payload
  );
  return data;
}

export async function toggleAdminCategoryActive(
  id: number
): Promise<CategoryResponse> {
  const { data } = await http.patch<CategoryResponse>(
    `/api/admin/categories/${id}/toggle-active`
  );
  return data;
}
