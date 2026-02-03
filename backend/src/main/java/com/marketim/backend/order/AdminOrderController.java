package com.marketim.backend.order;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    // ✅ PRODUCTION: server-side filter/sort/pagination
    // örnek:
    // /api/admin/orders?status=PENDING&page=0&size=20&sort=totalAmount,desc
    // /api/admin/orders?id=15
    @GetMapping
    public Page<OrderAdminListResponse> search(
            @RequestParam(required = false) Long id,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        OrderStatus st = "ALL".equalsIgnoreCase(status) ? null : OrderStatus.valueOf(status);
        return orderService.adminSearch(id, st, q, pageable);
    }

    // ✅ Mini sayaçlar: pending/delivered/cancelled/total
    @GetMapping("/stats")
    public AdminOrderStatsResponse stats() {
        return orderService.adminStats();
    }



    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getByIdAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return orderService.updateStatusAdmin(id, request.getStatus());
    }
}
