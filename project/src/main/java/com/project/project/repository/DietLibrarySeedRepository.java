package com.project.project.repository;

import com.project.project.entity.DietLibrarySeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DietLibrarySeedRepository extends JpaRepository<DietLibrarySeed, Long> {

    // İşareti yoksa ekler. 1 dönerse örnekleri bu istek yükler, 0 dönerse daha önce yüklenmiş demektir.
    // Aynı anda iki istek gelse de (StrictMode) yalnızca biri 1 alır.
    @Modifying
    @Query(value = "INSERT IGNORE INTO diet_library_seed (owner_id, seeded_at) VALUES (:ownerId, NOW(6))", nativeQuery = true)
    int insertIfAbsent(@Param("ownerId") Long ownerId);
}
