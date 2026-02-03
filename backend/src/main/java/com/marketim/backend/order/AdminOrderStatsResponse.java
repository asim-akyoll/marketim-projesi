package com.marketim.backend.order;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminOrderStatsResponse {
    private long pending;
    private long delivered;
    private long cancelled;
    private long total;
}
