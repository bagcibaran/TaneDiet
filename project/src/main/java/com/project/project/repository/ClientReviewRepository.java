package com.project.project.repository;

import com.project.project.entity.ClientReview;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ClientReviewRepository extends JpaRepository<ClientReview, Long> {

    Optional<ClientReview> findByClient(User client);

    // Danışan listesi: bütün danışanların incelemeleri tek sorguda
    List<ClientReview> findAllByClientIn(Collection<User> clients);

    // KVKK silme
    @Modifying
    void deleteAllByClient(User client);
}
