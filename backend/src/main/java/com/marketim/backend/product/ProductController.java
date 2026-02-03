package com.marketim.backend.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ✅ PUBLIC: production-ready list (active only) + pagination + filter + search
    // Örnek:
    // /api/products?categoryId=1&q=arm&page=0&size=20&sort=createdAt,desc
    @GetMapping
    public Page<ProductResponse> list(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "q", required = false) String q,
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return productService.publicSearch(categoryId, q, pageable);
    }
}
