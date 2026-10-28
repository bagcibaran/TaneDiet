package com.project.project.repository;

import com.project.project.entity.DietPlan;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {

    // En yeni program önce; ilki aktif programdır
    List<DietPlan> findAllByClientOrderByCreatedAtDesc(User client);

    Optional<DietPlan> findFirstByClientOrderByCreatedAtDesc(User client);

    Optional<DietPlan> findByIdAndClient(Long id, User client);

    boolean existsByClient(User client);
}
