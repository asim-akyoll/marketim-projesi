package com.marketim.backend.product;

import com.marketim.backend.exception.BadRequestException;
import com.marketim.backend.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminProductControllerIT {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    ProductService productService;

    @Test
    void adminEndpoints_shouldReturn403_whenNotAdmin() throws Exception {
        // user role (ADMIN değil)
        mockMvc.perform(patch("/api/admin/products/1/toggle-active"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void toggleActive_shouldReturn404Json_whenProductNotFound() throws Exception {
        when(productService.toggleActive(999L))
                .thenThrow(new NotFoundException("Product not found: 999"));

        mockMvc.perform(patch("/api/admin/products/999/toggle-active"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product not found: 999"))
                .andExpect(jsonPath("$.path").value("/api/admin/products/999/toggle-active"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_shouldReturn400Json_whenBusinessRuleFails() throws Exception {
        when(productService.create(any(ProductRequest.class)))
                .thenThrow(new BadRequestException("Cannot add product to inactive category: 1"));

        String body = """
                {
                  "name":"X",
                  "description":"Y",
                  "price":10.50,
                  "stock":5,
                  "imageUrl":"http://x",
                  "categoryId":1
                }
                """;

        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Cannot add product to inactive category: 1"))
                .andExpect(jsonPath("$.path").value("/api/admin/products"));
    }
}
