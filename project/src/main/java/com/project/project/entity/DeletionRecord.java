package com.project.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// KVKK: bir danışanın verilerinin silindiğinin kanıtı. Kişisel veri yok: yalnızca numara, silen, sebep ve zaman.
@Entity
@Table(name = "deletion_record")
public class DeletionRecord {

    // REQUEST: danışanın talebiyle diyetisyen sildi · RETENTION: hizmet bittikten 2 yıl sonra otomatik
    public enum Reason { REQUEST, RETENTION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Silinen kullanıcının numarası (yabancı anahtar değil: kullanıcı artık yok)
    @Column(nullable = false)
    private Long clientId;

    // Otomatik silmede boş
    @ManyToOne
    @JoinColumn(name = "deleted_by_id")
    private User deletedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Reason reason;

    @Column(nullable = false)
    private LocalDateTime deletedAt;

    public DeletionRecord() {
    }

    public DeletionRecord(Long clientId, User deletedBy, Reason reason, LocalDateTime deletedAt) {
        this.clientId = clientId;
        this.deletedBy = deletedBy;
        this.reason = reason;
        this.deletedAt = deletedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getClientId() {
        return clientId;
    }

    public User getDeletedBy() {
        return deletedBy;
    }

    public Reason getReason() {
        return reason;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
}
