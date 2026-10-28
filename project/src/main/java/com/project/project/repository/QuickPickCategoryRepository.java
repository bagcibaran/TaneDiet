package com.project.project.repository;

import com.project.project.entity.QuickPickCategory;
import com.project.project.entity.QuickPickItem;
import com.project.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuickPickCategoryRepository extends JpaRepository<QuickPickCategory, Long> {

    List<QuickPickCategory> findAllByOwnerOrderByPositionAscIdAsc(User owner);

    // Başka diyetisyenin kaydı bulunmaz (404)
    Optional<QuickPickCategory> findByIdAndOwner(Long id, User owner);

    // En büyük sıra; hiç kategori yoksa -1 (yeni kategori sona eklenir, silinenler araya sokmaz)
    @Query("select coalesce(max(c.position), -1) from QuickPickCategory c where c.owner = :owner")
    int findMaxPosition(@Param("owner") User owner);

    // Madde, kategorisi bu diyetisyene aitse bulunur
    @Query("select i from QuickPickItem i where i.id = :id and i.category.owner = :owner")
    Optional<QuickPickItem> findItemByIdAndOwner(@Param("id") Long id, @Param("owner") User owner);
}
