package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatusChartItemResponse {
    private String status;
    private long count;
}

