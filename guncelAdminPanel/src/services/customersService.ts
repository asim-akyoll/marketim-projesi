import http from "./http";

export type AdminCustomerResponse = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
};

// Spring Page<T> yapısı
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index
  size: number;
};

export type CustomerOrderAdminListResponse = {
  id: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  totalAmount: number; // backend
  createdAt: string; // backend
  customerName?: string;
  address?: string;
  itemsCount?: number;
};

export async function getAdminCustomers(params: {
  q?: string;
  active?: boolean;
  page?: number;
  size?: number;
}) {
  const { q, active, page = 0, size = 200 } = params;

  const res = await http.get<PageResponse<AdminCustomerResponse>>(
    `/api/admin/customers`,
    { params: { q, active, page, size } }
  );

  return res.data;
}

export async function getAdminCustomerById(id: number) {
  const res = await http.get<AdminCustomerResponse>(
    `/api/admin/customers/${id}`
  );
  return res.data;
}

export async function toggleAdminCustomerActive(id: number) {
  const res = await http.patch<AdminCustomerResponse>(
    `/api/admin/customers/${id}/toggle-active`
  );
  return res.data;
}

export async function getAdminCustomerOrders(params: {
  customerId: number;
  page?: number;
  size?: number;
  sort?: string; // "createdAt,desc"
}) {
  const { customerId, page = 0, size = 5, sort = "createdAt,desc" } = params;

  const res = await http.get<PageResponse<CustomerOrderAdminListResponse>>(
    `/api/admin/customers/${customerId}/orders`,
    { params: { page, size, sort } }
  );

  return res.data;
}
