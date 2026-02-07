package com.lms.repository;

import com.lms.entity.SubModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SubModuleRepository extends JpaRepository<SubModule, Long> {
    List<SubModule> findByModuleIdOrderByOrderIndexAsc(Long moduleId);
    int countByModuleId(Long moduleId);
    
    @Query("SELECT sm FROM SubModule sm WHERE sm.module.course.id = :courseId ORDER BY sm.module.orderIndex, sm.orderIndex")
    List<SubModule> findByCourseId(Long courseId);
    
    @Query("SELECT COUNT(sm) FROM SubModule sm WHERE sm.module.course.id = :courseId")
    int countByCourseId(Long courseId);
}
