package com.project.project.dto;

import com.project.project.entity.QuickPickItem;

public class QuickPickItemResponse {

    private final Long id;
    private final String text;

    public QuickPickItemResponse(QuickPickItem item) {
        this.id = item.getId();
        this.text = item.getText();
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }
}
