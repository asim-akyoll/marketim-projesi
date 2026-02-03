package com.marketim.backend.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 60, message = "Category name must be between 2 and 60 characters")
    private String name;

    @Size(max = 255, message = "Description can be max 255 characters")
    private String description;
}

