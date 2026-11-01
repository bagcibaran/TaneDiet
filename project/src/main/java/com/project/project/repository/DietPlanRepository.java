package com.project.project.repository;

import com.project.project.entity.DietPlan;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {

    // En yeni program önce; ilki aktif programdır
    List<DietPlan> findAllByClientOrderByCreatedAtDesc(User client);

    Optional<DietPlan> findFirstByClientOrderByCreatedAtDesc(User client);

    Optional<DietPlan> findByIdAndClient(Long id, User client);

    boolean existsByClient(User client);

    // Danışan listesi: programı olan danışanların id'leri tek sorguda (kartlardaki ✓)
    @Query("select distinct p.client.id from DietPlan p")
    List<Long> findClientIdsWithPlan();
}
