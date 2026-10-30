package com.project.project.repository;

import com.project.project.entity.ClientReview;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface ClientReviewRepository extends JpaRepository<ClientReview, Long> {

    Optional<ClientReview> findByClient(User client);

    // KVKK silme
    @Modifying
    void deleteAllByClient(User client);
}
