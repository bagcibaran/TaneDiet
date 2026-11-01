package com.project.project.repository;

import com.project.project.entity.IntakeForm;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface IntakeFormRepository extends JpaRepository<IntakeForm, Long> {

    Optional<IntakeForm> findByUser(User user);

    // Danışan listesi: bütün danışanların formları tek sorguda
    List<IntakeForm> findAllByUserIn(Collection<User> users);

    boolean existsByUser(User user);

    // KVKK silme
    @Modifying
    void deleteAllByUser(User user);
}
