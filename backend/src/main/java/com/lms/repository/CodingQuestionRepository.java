package com.lms.repository;

import com.lms.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {
    List<CodingQuestion> findBySubModuleIdOrderByOrderIndexAsc(Long subModuleId);
}
