package com.project.project.repository;

import com.project.project.entity.TaskEntity;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    List<TaskEntity> findAllByUser(User user);

    Optional<TaskEntity> findByIdAndUser(Long id, User user);

    // KVKK silme
    @Modifying
    void deleteAllByUser(User user);
}
