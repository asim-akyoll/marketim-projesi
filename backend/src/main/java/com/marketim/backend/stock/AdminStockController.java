package com.marketim.backend.stock;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stock-movements")
@RequiredArgsConstructor
public class AdminStockController {

    private final StockMovementService stockMovementService;

    // /api/admin/stock-movements?productId=1&page=0&size=20&sort=createdAt,desc
    @GetMapping
    public Page<StockMovementResponse> list(
            @RequestParam Long productId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return stockMovementService.getByProduct(productId, pageable);
    }
}

