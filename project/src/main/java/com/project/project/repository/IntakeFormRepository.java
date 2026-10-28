package com.project.project.repository;

import com.project.project.entity.IntakeForm;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IntakeFormRepository extends JpaRepository<IntakeForm, Long> {

    Optional<IntakeForm> findByUser(User user);
}
