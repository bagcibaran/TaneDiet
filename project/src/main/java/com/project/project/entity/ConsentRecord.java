package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// KVKK: danışanın onayladığı açık rıza metninin sürümü, metnin özeti (SHA-256) ve onay zamanı
@Entity
@Table(name = "consent_record")
public class ConsentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String version;

    // Onaylanan metnin özeti: metin sonradan değişse de hangi metnin onaylandığı kanıtlanır
    @Column(nullable = false, length = 64, columnDefinition = "CHAR(64)")
    private String textHash;

    @Column(nullable = false)
    private LocalDateTime acceptedAt;

    public ConsentRecord() {
    }

    public ConsentRecord(User user, String version, String textHash, LocalDateTime acceptedAt) {
        this.user = user;
        this.version = version;
        this.textHash = textHash;
        this.acceptedAt = acceptedAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getVersion() {
        return version;
    }

    public String getTextHash() {
        return textHash;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }
}
