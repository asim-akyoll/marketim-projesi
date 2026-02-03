package com.marketim.backend.order;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    // Sipariş oluştur (login gerekli)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderCreateRequest request) {
        return orderService.create(request);
    }

    // Kendi siparişlerim
    @GetMapping("/my")
    public List<OrderResponse> myOrders() {
        return orderService.getMyOrders();
    }

    // Siparişi iptal et (stok iadesi var)
    @PatchMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancelMyOrder(id);
    }
}

