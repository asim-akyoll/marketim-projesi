import http from "./http";

export type RevenueResponse = {
  today: number;
  last7Days: number;
  thisMonth: number;
};

export type RecentOrderResponse = {
  id: number;
  userFullName: string | null;
  totalAmount: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED" | string;
  createdAt: string;
};

export type DashboardSummaryResponse = {
  todayOrderCount: number;
  pending: number;
  delivered: number;
  cancelled: number;
  totalOrders: number;
  revenue: RevenueResponse;
  recentOrders: RecentOrderResponse[];
};

export type StatusChartItemResponse = {
  status: string;
  count: number;
};

export type StatusChartResponse = {
  range: "today" | "week" | "month" | string;
  items: StatusChartItemResponse[];
};

export async function getAdminDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { data } = await http.get<DashboardSummaryResponse>(
    "/api/admin/dashboard"
  );
  return data;
}

export async function getAdminDashboardStatusChart(
  range: "today" | "week" | "month"
): Promise<StatusChartResponse> {
  const { data } = await http.get<StatusChartResponse>(
    "/api/admin/dashboard/status-chart",
    { params: { range } }
  );
  return data;
}
