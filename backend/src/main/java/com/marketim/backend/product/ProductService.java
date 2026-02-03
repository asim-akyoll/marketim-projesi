package com.marketim.backend.product;

import com.marketim.backend.category.Category;
import com.marketim.backend.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.marketim.backend.exception.NotFoundException;
import com.marketim.backend.exception.BadRequestException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;


import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // -------------------------
    // ADMIN
    // -------------------------

    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()));
        if (!category.isActive()) {
            throw new BadRequestException("Cannot add product to inactive category: " + category.getId());
        }


        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .unitLabel(request.getUnitLabel())
                .category(category)
                .active(true)
                .build();

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllAdmin() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()));
        if (!category.isActive()) {
            throw new BadRequestException("Cannot move product to inactive category: " + category.getId());
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setUnitLabel(request.getUnitLabel());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    public ProductResponse toggleActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        product.setActive(!product.isActive());
        Product saved = productRepository.save(product);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getLowStock(Integer threshold, Pageable pageable) {
        int th = (threshold == null) ? 5 : threshold;
        if (th < 0) throw new BadRequestException("threshold must be >= 0");

        return productRepository.findByActiveTrueAndStockLessThanEqual(th, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> adminSearch(Boolean active, Long categoryId, String q, Pageable pageable) {

        Specification<Product> spec =
                ProductSpecifications.activeEquals(active)
                        .and(ProductSpecifications.categoryIdEquals(categoryId))
                        .and(ProductSpecifications.nameContains(q));

        return productRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }



    // -------------------------
    // PUBLIC
    // -------------------------

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActive() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: " + categoryId));


        return productRepository.findByCategoryAndActiveTrue(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchActiveByName(String q) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(q)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> publicSearch(Long categoryId, String q, Pageable pageable) {

        Specification<Product> spec =
                ProductSpecifications.activeEquals(true) // public: sadece aktif
                        .and(ProductSpecifications.categoryIdEquals(categoryId))
                        .and(ProductSpecifications.nameContains(q));

        return productRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }


    // -------------------------
    // Mapper (Category modülündeki stile uygun: service içinde basit dönüşüm)
    // -------------------------

    private ProductResponse toResponse(Product product) {
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .unitLabel(product.getUnitLabel())
                .active(product.isActive())
                .categoryId(categoryId)
                .categoryName(categoryName)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductResponse getByIdAdmin(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        return toResponse(product);
    }

}

