package com.project.project.repository;

import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
