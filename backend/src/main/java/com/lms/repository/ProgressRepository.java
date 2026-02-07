package com.lms.repository;

import com.lms.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByUserId(Long userId);
    Optional<Progress> findByUserIdAndSubModuleId(Long userId, Long subModuleId);
    
    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId AND p.subModule.module.course.id = :courseId")
    List<Progress> findByUserIdAndCourseId(Long userId, Long courseId);
    
    @Query("SELECT COUNT(p) FROM Progress p WHERE p.user.id = :userId AND p.subModule.module.course.id = :courseId AND p.completed = true")
    int countCompletedByUserIdAndCourseId(Long userId, Long courseId);
}
