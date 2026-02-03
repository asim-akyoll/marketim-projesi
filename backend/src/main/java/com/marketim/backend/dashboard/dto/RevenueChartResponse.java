package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RevenueChartResponse {
    private String range; // "week"
    private List<RevenueChartItemResponse> items;
}

