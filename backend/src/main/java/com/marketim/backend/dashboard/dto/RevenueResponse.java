package com.marketim.backend.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RevenueResponse {
    private BigDecimal today;
    private BigDecimal last7Days;
    private BigDecimal thisMonth;
}

