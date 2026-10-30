package com.project.project.repository;

import com.project.project.entity.Invite;
import com.project.project.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, Long> {

    Optional<Invite> findByToken(String token);

    // Kayıt sırasında satırı kilitler: aynı link aynı anda iki kez kullanılamasın
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Invite i where i.token = :token")
    Optional<Invite> findByTokenForUpdate(@Param("token") String token);

    // Açık davetler (kullanılmamış, süresi dolmamış), en yeni önce
    List<Invite> findAllByUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);

    // KVKK silme: kullanılmış davet kalır (kullanıldı bilgisi), ama silinen danışanla bağı kopar
    @Modifying
    @Query("update Invite i set i.usedBy = null where i.usedBy = :user")
    void clearUsedBy(@Param("user") User user);
}
