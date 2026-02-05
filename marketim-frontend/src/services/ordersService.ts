import http from "./http";

export type CreateOrderItemRequest = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: CreateOrderItemRequest[];
  deliveryAddress: string;
  paymentMethod: string; // şimdilik string
  note?: string;
  contactPhone?: string;
  guestName?: string;
  guestEmail?: string;
};

export const createOrder = async (payload: CreateOrderRequest) => {
  const response = await http.post("/api/orders", payload);
  return response.data;
};

// -----------------------------
// MY ORDERS (Account sayfası)
// -----------------------------
export type OrderStatus = "PREPARING" | "DELIVERED" | "CANCELLED";

export interface MyOrderItemDto {
  productName: string;
  quantity: number;
  lineTotal: number;
}

export interface MyOrderDto {
  id: number;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items?: MyOrderItemDto[];
}

/**
 * Customer: kendi siparişlerini listeler
 * Backend endpoint: GET /api/orders/my
 */
export const ordersService = {
  async my() {
    const res = await http.get<MyOrderDto[]>("/api/orders/my");
    return res.data;
  },
};
