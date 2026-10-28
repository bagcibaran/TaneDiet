package com.project.project.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// Hızlı madde kategorisi (Kahvaltılık, Protein, ...). Maddeleri kategoriyle birlikte kaydedilir ve silinir.
@Entity
@Table(name = "quick_pick_category")
public class QuickPickCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 50)
    private String name;

    // Kategoriler arasındaki sıra (yeni kategori sona eklenir)
    @Column(nullable = false)
    private int position;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC")
    private List<QuickPickItem> items = new ArrayList<>();

    public QuickPickCategory() {
    }

    public QuickPickCategory(User owner, String name, int position) {
        this.owner = owner;
        this.name = name;
        this.position = position;
    }

    // Yeni maddeyi sona ekler (silinen maddeler yüzünden sayı değil, en büyük sıra + 1)
    public QuickPickItem addItem(String text) {
        int position = items.stream().mapToInt(QuickPickItem::getPosition).max().orElse(-1) + 1;
        QuickPickItem item = new QuickPickItem(this, text, position);
        items.add(item);
        return item;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPosition() {
        return position;
    }

    public List<QuickPickItem> getItems() {
        return items;
    }
}
