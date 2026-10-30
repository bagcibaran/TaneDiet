package com.project.project.repository;

import com.project.project.entity.ConsentRecord;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, Long> {

    // En son onay (güncel sürüm mü diye bakılır)
    Optional<ConsentRecord> findFirstByUserOrderByAcceptedAtDesc(User user);

    List<ConsentRecord> findAllByUserOrderByAcceptedAtDesc(User user);

    @Modifying
    void deleteAllByUser(User user);
}
