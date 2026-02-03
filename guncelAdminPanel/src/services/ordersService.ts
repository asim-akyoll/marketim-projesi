import http from "./http";

/**
 * Backend Page response yapısı:
 * {
 *   content: [],
 *   totalElements: number,
 *   totalPages: number,
 *   number: number,
 *   size: number
 * }
 */

export type OrderStatus = "PENDING" | "DELIVERED" | "CANCELLED";

export type OrderAdminListItem = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;

  customerName?: string;
  address?: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type OrdersQuery = {
  page?: number;
  size?: number;
  status?: OrderStatus;
};

export async function getAdminOrders(
  query: OrdersQuery = {}
): Promise<PageResponse<OrderAdminListItem>> {
  const { data } = await http.get<PageResponse<OrderAdminListItem>>(
    "/api/admin/orders",
    {
      params: {
        page: query.page ?? 0,
        size: query.size ?? 10,
        status: query.status,
      },
    }
  );

  return data;
}

/* =======================
   ORDER DETAIL
======================= */

export type OrderItemResponse = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unitLabel?: string | null;
};

export type OrderAdminDetailResponse = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;

  customerName: string;
  address: string;

  items: OrderItemResponse[];
};

export async function getAdminOrderDetail(
  id: number
): Promise<OrderAdminDetailResponse> {
  const { data } = await http.get<OrderAdminDetailResponse>(
    `/api/admin/orders/${id}`
  );
  return data;
}

export type OrderStatusUpdateRequest = {
  status: OrderStatus;
};

export async function updateAdminOrderStatus(
  id: number,
  status: OrderStatus
): Promise<void> {
  await http.patch(`/api/admin/orders/${id}/status`, {
    status,
  } satisfies OrderStatusUpdateRequest);
}
