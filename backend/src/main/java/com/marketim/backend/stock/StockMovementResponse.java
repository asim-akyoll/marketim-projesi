package com.marketim.backend.stock;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private StockMovementType type;
    private Integer delta;
    private Integer beforeStock;
    private Integer afterStock;
    private String referenceType;
    private Long referenceId;
    private String note;
    private String actor;
    private LocalDateTime createdAt;
}

