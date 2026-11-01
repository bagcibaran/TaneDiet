package com.project.project.repository;

import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, Long> {

    List<WeightEntry> findAllByUserOrderByMeasuredOnDescCreatedAtDesc(User user);
    Optional<WeightEntry> findByIdAndUser(Long id, User user);

    boolean existsByUser(User user);

    // Bildirimler: belirli bir andan sonra, belirli bir kişinin girdiği kayıtlar
    long countByUserAndEnteredByAndCreatedAtAfter(User user, User enteredBy, LocalDateTime after);

    List<WeightEntry> findAllByUserAndEnteredByAndCreatedAtAfter(User user, User enteredBy, LocalDateTime after);

    // Danışan listesi: danışan başına, diyetisyenin son bakışından sonra danışanın kendi girdiği kilo sayısı
    // (hiç bakılmadıysa hepsi). Satırlar: [danışan id (Long), sayı (Long)]; yeni kilosu olmayan danışan listede yok.
    @Query("select w.user.id, count(w) from WeightEntry w left join ClientReview r on r.client = w.user "
            + "where w.enteredBy = w.user and (r.id is null or w.createdAt > r.reviewedAt) group by w.user.id")
    List<Object[]> countNewClientWeights();

    // KVKK silme
    @Modifying
    void deleteAllByUser(User user);
}
