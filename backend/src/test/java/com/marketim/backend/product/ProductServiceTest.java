package com.marketim.backend.product;

import com.marketim.backend.category.Category;
import com.marketim.backend.category.CategoryRepository;
import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    ProductRepository productRepository;

    @Mock
    CategoryRepository categoryRepository;

    @InjectMocks
    ProductService productService;

    @Test
    void create_shouldThrowBadRequest_whenCategoryInactive() {
        // given
        Category inactiveCategory = Category.builder()
                .id(1L)
                .name("Meyve & Sebzeler")
                .active(false)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(inactiveCategory));

        ProductRequest req = ProductRequest.builder()
                .name("Test")
                .description("desc")
                .price(new BigDecimal("10.50"))
                .stock(5)
                .imageUrl("http://x")
                .categoryId(1L)
                .build();

        // when + then
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> productService.create(req));

        assertTrue(ex.getMessage().contains("inactive category"));
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void create_shouldThrowNotFound_whenCategoryMissing() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        ProductRequest req = ProductRequest.builder()
                .name("Test")
                .price(new BigDecimal("10.50"))
                .stock(5)
                .categoryId(99L)
                .build();

        assertThrows(NotFoundException.class, () -> productService.create(req));
        verify(productRepository, never()).save(any());
    }
}
