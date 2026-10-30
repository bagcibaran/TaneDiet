package com.project.project.repository;

import com.project.project.entity.AccessLog;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    List<AccessLog> findAllByClientOrderByCreatedAtDesc(User client);

    @Modifying
    void deleteAllByClient(User client);

    // 2 yıldan eski görüntüleme kayıtları silinir (saklama süresi). Gece işi transaction dışında çağırdığı için kendi transaction'ı var.
    @Transactional
    @Modifying
    @Query("delete from AccessLog a where a.createdAt < :before")
    int deleteOlderThan(@Param("before") LocalDateTime before);
}
