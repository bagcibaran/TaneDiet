package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Diyetisyenin hizmet satın alan kişiye gönderdiği davet: tek kullanımlık, süreli, paket süresini taşır
@Entity
@Table(name = "invite")
public class Invite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true)
    private String token;

    // Kimin için (ör. "Ayşe Y."); boş olabilir
    @Column(length = 60)
    private String note;

    // Paket süresi (ay): 1, 3 veya 6
    @Column(nullable = false)
    private int months;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime usedAt;

    @ManyToOne
    @JoinColumn(name = "used_by_id")
    private User usedBy;

    public Invite() {
    }

    public Invite(User createdBy, String token, String note, int months, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.createdBy = createdBy;
        this.token = token;
        this.note = note;
        this.months = months;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    // Kullanılmamış ve süresi dolmamışsa kullanılabilir
    public boolean isUsable(LocalDateTime now) {
        return usedAt == null && now.isBefore(expiresAt);
    }

    public void markUsed(User user, LocalDateTime now) {
        this.usedBy = user;
        this.usedAt = now;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public String getNote() {
        return note;
    }

    public int getMonths() {
        return months;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public User getUsedBy() {
        return usedBy;
    }
}
