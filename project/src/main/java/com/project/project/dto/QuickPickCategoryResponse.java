package com.project.project.dto;

import com.project.project.entity.QuickPickCategory;

import java.util.List;

public class QuickPickCategoryResponse {

    private final Long id;
    private final String name;
    private final List<QuickPickItemResponse> items;

    public QuickPickCategoryResponse(QuickPickCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.items = category.getItems().stream().map(QuickPickItemResponse::new).toList();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<QuickPickItemResponse> getItems() {
        return items;
    }
}
