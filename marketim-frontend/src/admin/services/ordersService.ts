import http from "./http";

export type OrderStatus = "PREPARING" | "DELIVERED" | "CANCELLED";

export interface OrderAdminListItem {
  id: number;
  createdAt: string; // ISO string
  status: OrderStatus;

  // UI'nin kullandığı alanlar
  customerName?: string;
  address?: string;
  totalAmount?: number;
}

export interface OrderAdminDetailItem {
  productName: string;
  quantity: number;
  unitLabel?: string;
  lineTotal: number;

  // backend döndürüyorsa opsiyonel
  unitPrice?: number;
}

export interface OrderAdminDetailResponse extends OrderAdminListItem {
  deliveryAddress?: string;
  contactPhone?: string;
  paymentMethod?: string;
  items: OrderAdminDetailItem[];
}

export interface AdminOrdersPageDto {
  content: OrderAdminListItem[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based
  size: number;
}

export type AdminOrdersQuery = {
  page?: number;
  size?: number;
  sort?: string; // "id,desc"
  status?: OrderStatus;
  q?: string;
  dateFrom?: string; // "2026-01-16"
  dateTo?: string;
};

export const adminOrdersService = {
  async list(params: AdminOrdersQuery = {}) {
    const res = await http.get<AdminOrdersPageDto>("/api/admin/orders", {
      params,
    });
    return res.data;
  },

  async getById(orderId: number) {
    const res = await http.get<OrderAdminDetailResponse>(
      `/api/admin/orders/${orderId}`
    );
    return res.data;
  },

  async updateStatus(orderId: number, status: OrderStatus) {
    const res = await http.patch<OrderAdminDetailResponse>(
      `/api/admin/orders/${orderId}/status`,
      { status }
    );
    return res.data;
  },
};
