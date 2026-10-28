package com.project.project.entity;

import jakarta.persistence.*;

// Hızlı madde: tek dokunuşla öğüne eklenen bir satır ("2 haşlanmış yumurta")
@Entity
@Table(name = "quick_pick_item")
public class QuickPickItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private QuickPickCategory category;

    @Column(nullable = false, length = 255)
    private String text;

    // Kategori içindeki sıra
    @Column(nullable = false)
    private int position;

    public QuickPickItem() {
    }

    public QuickPickItem(QuickPickCategory category, String text, int position) {
        this.category = category;
        this.text = text;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuickPickCategory getCategory() {
        return category;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getPosition() {
        return position;
    }
}
