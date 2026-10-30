package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// KVKK: diyetisyenin bir danışanın sağlık bilgilerini görüntülemesi ya da dışa aktarması. İçerik tutulmaz.
@Entity
@Table(name = "access_log")
public class AccessLog {

    public enum Action { VIEW_INTAKE, EXPORT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "viewer_id", nullable = false)
    private User viewer;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Action action;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AccessLog() {
    }

    public AccessLog(User viewer, User client, Action action, LocalDateTime createdAt) {
        this.viewer = viewer;
        this.client = client;
        this.action = action;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public User getViewer() {
        return viewer;
    }

    public User getClient() {
        return client;
    }

    public Action getAction() {
        return action;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
