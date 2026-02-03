package com.marketim.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.marketim.backend.order.OrderService;
import com.marketim.backend.order.OrderAdminListResponse;
import org.springframework.data.domain.Sort;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/customers")

public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;
    private final OrderService orderService;

    // ✅ LIST: /api/admin/customers?q=ali&active=true&page=0&size=20
    @GetMapping
    public ResponseEntity<Page<AdminCustomerResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(adminCustomerService.search(q, active, pageable));
    }

    // ✅ TOGGLE ACTIVE: /api/admin/customers/{id}/toggle-active
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AdminCustomerResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminCustomerService.toggleActive(id));
    }

    // ✅ GET /api/admin/customers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AdminCustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminCustomerService.getById(id));
    }


    // ✅ NEW: Customer Order History
    // /api/admin/customers/{id}/orders?page=0&size=10&sort=createdAt,desc
    @GetMapping("/{id}/orders")
    public ResponseEntity<Page<OrderAdminListResponse>> customerOrders(
            @PathVariable Long id,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.adminOrdersByCustomerId(id, pageable));
    }
}
