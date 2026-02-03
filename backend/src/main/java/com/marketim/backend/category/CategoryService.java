package com.marketim.backend.category;

import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final com.marketim.backend.product.ProductRepository productRepository;

    // -------------------------
    // ADMIN LIST (PRODUCTION READY)
    // -------------------------
    public CategoryAdminListResponse getAdminCategories(
            int page,
            int size,
            String q,
            Boolean active,
            String sort,
            Sort.Direction direction
    ) {
        String sortField = ("name".equalsIgnoreCase(sort) || "id".equalsIgnoreCase(sort)) ? sort : "id";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Specification<Category> spec = Specification.allOf(
                CategorySpecifications.q(q),
                CategorySpecifications.active(active));

        Page<Category> result = categoryRepository.findAll(spec, pageable);

        List<CategoryResponse> items = result.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return CategoryAdminListResponse.builder()
                .items(items)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    // -------------------------
    // ADMIN CRUD
    // -------------------------
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id " + id));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = normalizeName(request.getName());

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Category already exists with name: " + name);
        }

        String baseSlug = generateSlug(name);
        String uniqueSlug = ensureUniqueSlug(baseSlug, null);

        Category category = Category.builder()
                .name(name)
                .slug(uniqueSlug)
                .description(request.getDescription())
                .active(true)
                .build();

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id " + id));

        String name = normalizeName(request.getName());

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Category already exists with name: " + name);
        }

        String baseSlug = generateSlug(name);
        String uniqueSlug = ensureUniqueSlug(baseSlug, id);

        category.setName(name);
        category.setDescription(request.getDescription());
        category.setSlug(uniqueSlug);

        Category updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Transactional
    public CategoryResponse toggleActive(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id " + id));

        category.setActive(!category.isActive());
        Category updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found with id " + id);
        }

        if (productRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Bu kategoriye ait ürünler var. Önce ürünleri silmeli veya başka kategoriye taşımalısınız.");
        }

        categoryRepository.deleteById(id);
    }

    // -------------------------
    // PUBLIC
    // -------------------------
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // -------------------------
    // Helpers
    // -------------------------
    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .active(category.isActive())
                .build();
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    private String ensureUniqueSlug(String baseSlug, Long currentIdOrNull) {
        String slug = baseSlug;
        int i = 2;

        while (true) {
            boolean exists;
            if (currentIdOrNull == null) {
                exists = categoryRepository.existsBySlug(slug);
            } else {
                exists = categoryRepository.existsBySlugAndIdNot(slug, currentIdOrNull);
            }

            if (!exists) return slug;

            slug = baseSlug + "-" + i;
            i++;
        }
    }

    // Türkçe karakterleri temizleyerek slug üret
    private String generateSlug(String name) {
        if (name == null) return null;

        String slug = name.toLowerCase(Locale.of("tr", "TR"));

        slug = slug
                .replace("ı", "i")
                .replace("ğ", "g")
                .replace("ü", "u")
                .replace("ş", "s")
                .replace("ö", "o")
                .replace("ç", "c");

        slug = Normalizer.normalize(slug, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");

        slug = slug.replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-+|-+$", "");

        return slug;
    }
}
