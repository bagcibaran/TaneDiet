package com.project.project.repository;

import com.project.project.entity.DeletionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeletionRecordRepository extends JpaRepository<DeletionRecord, Long> {
}
