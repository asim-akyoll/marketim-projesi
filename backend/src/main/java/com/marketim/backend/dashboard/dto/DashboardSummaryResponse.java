package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;


import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {

    private long todayOrderCount;

    private long pending;
    private long delivered;
    private long cancelled;
    private long totalOrders;

    private RevenueResponse revenue;

    private List<RecentOrderResponse> recentOrders;
}
