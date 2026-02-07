package com.lms.repository;

import com.lms.entity.McqQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface McqQuestionRepository extends JpaRepository<McqQuestion, Long> {
    List<McqQuestion> findBySubModuleIdOrderByOrderIndexAsc(Long subModuleId);
}
