package com.project.project.dto;

import com.project.project.entity.MealTemplate;

public class MealTemplateResponse {

    private final Long id;
    private final String name;
    private final String time;
    private final String items;

    public MealTemplateResponse(MealTemplate template) {
        this.id = template.getId();
        this.name = template.getName();
        this.time = template.getMealTime();
        this.items = template.getItems();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getTime() {
        return time;
    }

    public String getItems() {
        return items;
    }
}
