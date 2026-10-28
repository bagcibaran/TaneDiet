package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Diyetisyenin bir danışanın sayfasına en son ne zaman baktığı. Bundan sonraki değişiklikler "yeni" sayılır.
@Entity
@Table(name = "client_review")
public class ClientReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false)
    private LocalDateTime reviewedAt;

    public ClientReview() {
    }

    public ClientReview(User client) {
        this.client = client;
        this.reviewedAt = LocalDateTime.now();
    }

    public void markReviewed() {
        this.reviewedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getClient() {
        return client;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
}
