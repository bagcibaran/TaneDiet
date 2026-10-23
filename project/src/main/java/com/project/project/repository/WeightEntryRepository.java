package com.project.project.repository;

import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, Long> {

    List<WeightEntry> findAllByUserOrderByMeasuredOnDescCreatedAtDesc(User user);
}