package com.project.project.repository;

import com.project.project.entity.ClientReview;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientReviewRepository extends JpaRepository<ClientReview, Long> {

    Optional<ClientReview> findByClient(User client);
}
