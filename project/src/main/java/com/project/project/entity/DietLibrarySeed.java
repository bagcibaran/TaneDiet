package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// "Bu diyetisyene örnek öğün ve maddeler yüklendi" işareti. Satır varsa örnekler bir daha yüklenmez.
@Entity
@Table(name = "diet_library_seed")
public class DietLibrarySeed {

    @Id
    @Column(name = "owner_id")
    private Long ownerId;

    @Column(nullable = false)
    private LocalDateTime seededAt;

    public DietLibrarySeed() {
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public LocalDateTime getSeededAt() {
        return seededAt;
    }
}
