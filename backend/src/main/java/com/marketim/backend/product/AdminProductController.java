package com.marketim.backend.product;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    // ✅ PRODUCTION-READY ADMIN LIST (server-side pagination + filter + sort)
    // /api/admin/products?active=true&categoryId=1&q=arm&page=0&size=20&sort=createdAt,desc
    @GetMapping
    public Page<ProductResponse> getAllAdmin(
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "q", required = false) String q,
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return productService.adminSearch(active, categoryId, q, pageable);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @PatchMapping("/{id}/toggle-active")
    public ProductResponse toggleActive(@PathVariable Long id) {
        return productService.toggleActive(id);
    }

    // ✅ Low stock endpoint aynen duruyor
    @GetMapping("/low-stock")
    public Page<ProductResponse> lowStock(
            @RequestParam(value = "threshold", required = false) Integer threshold,
            @PageableDefault(size = 20, sort = "stock") Pageable pageable
    ) {
        return productService.getLowStock(threshold, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getByIdAdmin(id);
    }

}
