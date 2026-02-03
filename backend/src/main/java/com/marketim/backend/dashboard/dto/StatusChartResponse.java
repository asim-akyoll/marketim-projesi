package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StatusChartResponse {
    private String range; // today | week | month
    private List<StatusChartItemResponse> items;
}

