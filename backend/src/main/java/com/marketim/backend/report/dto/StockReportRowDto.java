package com.marketim.backend.report.dto;

import lombok.Builder;

@Builder
public record StockReportRowDto(
        String productName,
        Integer stock,
        boolean critical
) {}
