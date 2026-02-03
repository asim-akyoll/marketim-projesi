package com.marketim.backend.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CategoryAdminListResponse {
    private List<CategoryResponse> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
