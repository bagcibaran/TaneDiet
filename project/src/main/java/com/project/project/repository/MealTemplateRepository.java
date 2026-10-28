package com.project.project.repository;

import com.project.project.entity.MealTemplate;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealTemplateRepository extends JpaRepository<MealTemplate, Long> {

    List<MealTemplate> findAllByOwner(User owner);

    // Başka diyetisyenin kaydı bulunmaz (404)
    Optional<MealTemplate> findByIdAndOwner(Long id, User owner);
}
