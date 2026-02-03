import http from "./http";

export type CreateOrderItemRequest = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: CreateOrderItemRequest[];
  deliveryAddress: string;
  paymentMethod: string; // şimdilik string
};

export const createOrder = async (payload: CreateOrderRequest) => {
  const response = await http.post("/api/orders", payload);
  return response.data;
};
